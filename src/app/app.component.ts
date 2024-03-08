import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('content', { static: true }) private content!: ElementRef;

  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private dragControl!: DragControls;
  private orbitControl!: OrbitControls;
  private scene!: THREE.Scene;
  private loader!: FBXLoader;

  objects: any[] = []; // objects for drag & drop
  objId: number = 0;
  selectedObject: any = null;

  constructor(private renderer2: Renderer2) {}

  ngOnInit(): void {
    this.load();
    window.addEventListener('resize', this.updateSize.bind(this));
  }

  load() {
    //scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('gainsboro');

    //camera
    this.camera = new THREE.PerspectiveCamera(
      50,
      (this.content.nativeElement as HTMLElement).offsetWidth /
        (this.content.nativeElement as HTMLElement).offsetHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(this.scene.position);

    //renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setClearColor(0xffffff);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(
      (this.content.nativeElement as HTMLElement).offsetWidth,
      (this.content.nativeElement as HTMLElement).offsetHeight
    );
    this.renderer2.appendChild(
      this.content.nativeElement,
      this.renderer.domElement
    );

    //light

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(0, 0, 10);
    this.scene.add(light);

    this.dragControl = new DragControls(
      this.objects,
      this.camera,
      this.renderer.domElement
    );

    this.orbitControl = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.orbitControl.enableRotate = true;
    this.orbitControl.enableZoom = true;

    this.dragControl.addEventListener('dragstart', (event: any) => {
      this.orbitControl.enabled = false;
    });
    this.dragControl.addEventListener('dragend', (event: any) => {
      this.orbitControl.enabled = true;
    });

    //loader
    this.loader = new FBXLoader();

    this.animate();
  }

  loadFile(event: any) {
    console.log(event);
    let file = event.target.files[0];
    const url = URL.createObjectURL(file);
    this.loader.load(url, (obj) => {
      let box = new THREE.Box3().setFromObject(obj);
      let size = box.getSize(new THREE.Vector3());
      console.log(box.getSize(new THREE.Vector3()));
      obj.scale.set(
        Math.abs(1 / size.x),
        Math.abs(1 / size.y),
        Math.abs(1 / size.z)
      );
      console.log(obj);
      obj.uuid = event.target.files[0].name + ' id:' + this.objId++;
      this.scene.add(obj);
      this.dragControl.getObjects().push(obj);
    });
  }

  rotateX(obj: any) {
    obj.rotateX(45);
  }
  rotateY(obj: any) {
    obj.rotateY(45);
  }
  removeObj(obj: any) {
    this.dragControl.getObjects().splice(
      this.dragControl.getObjects().findIndex((el) => el.uuid == obj.uuid),
      1
    );
    this.scene.remove(obj);
    this.selectedObject = null;
    this.render();
  }
  scaleUp(obj: any) {
    obj.scale.set(
      (obj.scale.x += 0.01),
      (obj.scale.y += 0.01),
      (obj.scale.z += 0.01)
    );
  }
  scaleDown(obj: any) {
    obj.scale.set(
      (obj.scale.x -= 0.01),
      (obj.scale.y -= 0.01),
      (obj.scale.z -= 0.01)
    );
  }
  selectObject(obj: any) {
    this.selectedObject = obj;
  }

  addLabel(labelText: string) {

    let loader = new FontLoader();
    loader.load(
      'https://cdn.rawgit.com/mrdoob/three.js/master/examples/fonts/helvetiker_regular.typeface.json',
      (font) => {
        var geometry = new TextGeometry(`${labelText}`, {
          font: font,
          size: 10,
          height: 5,
        });

        var material = new THREE.MeshBasicMaterial({
          color: 'black',
        });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, 0.5);
        mesh.scale.multiplyScalar(0.01);
        mesh.uuid = labelText + ' id:' + this.objId++;
        this.scene.add(mesh);
        this.dragControl.getObjects().push(mesh);
      }
    );
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  updateSize() {
    this.camera.aspect =
      (this.content.nativeElement as HTMLElement).offsetWidth /
      (this.content.nativeElement as HTMLElement).offsetHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      (this.content.nativeElement as HTMLElement).offsetWidth,
      (this.content.nativeElement as HTMLElement).offsetHeight
    );
    this.renderer2.setStyle(
      document.getElementsByTagName('canvas')[0],
      'width',
      (this.content.nativeElement as HTMLElement).offsetWidth
    );
    this.renderer2.setStyle(
      document.getElementsByTagName('canvas')[0],
      'height',
      (this.content.nativeElement as HTMLElement).offsetHeight
    );
    this.render();
  }

  animate() {
    this.render();
    requestAnimationFrame(this.render.bind(this));
  }
}
