import * as THREE from 'three';
import type { AppState, VoiceCommand } from '../types';
import { applyDashShader, type DashControls } from '../mesh/dashShader';
import { ResectionPlane } from './ResectionPlane';
import { cutMesh } from '../mesh/cutMesh';
import { validateCommand } from './stateMachine';
import { UI } from '../ui/UI';

const SEGMENT_GAP = 3;

type SegmentName = 'proximal' | 'middle' | 'distal';

export class CutManager {
  private scene: THREE.Scene;
  private ui: UI;
  private plane: ResectionPlane;
  private dash: DashControls;

  private state: AppState = 'plane_active';
  private twoCutMode = false;

  private bone: THREE.Mesh | null;
  private inactive: THREE.Mesh | null = null;
  private segments: Record<SegmentName, THREE.Mesh | null> = {
    proximal: null, middle: null, distal: null,
  };

  constructor(scene: THREE.Scene, bone: THREE.Mesh, ui: UI) {
    this.scene = scene;
    this.ui = ui;
    this.bone = bone;

    bone.castShadow = true;
    bone.receiveShadow = true;
    scene.add(bone);

    bone.geometry.computeBoundingBox();
    this.plane = new ResectionPlane(bone.geometry.boundingBox!);
    this.dash = applyDashShader(bone.material as THREE.MeshStandardMaterial);
    this.syncDash();

    ui.onModeToggle(() => this.toggleMode());
    ui.setTwoCutMode(false);
    this.syncUI();
  }

  handleCommand(cmd: VoiceCommand): void {
    const ctx = this.buildContext();
    const result = validateCommand(this.state, cmd, ctx);
    if (!result.allowed) return;

    const prevState = this.state;
    this.state = result.newState;

    switch (cmd) {
      case 'up': this.movePlane('up'); break;
      case 'down': this.movePlane('down'); break;
      case 'cut':
        if (!this.executeCut()) { this.state = prevState; return; }
        break;
      default:
        this.toggleSegment(cmd.replace('toggle_', '') as SegmentName);
        break;
    }

    this.ui.setLastCommand(`Heard: "${cmd.replace('_', ' ')}"`);
    this.syncUI();
  }

  private buildContext() {
    return {
      hasBone: this.bone !== null,
      hasProximal: this.segments.proximal !== null,
      hasDistal: this.segments.distal !== null,
      hasMiddle: this.segments.middle !== null,
      twoCutMode: this.twoCutMode,
    };
  }

  private enabledCommands(): Set<VoiceCommand> {
    const all: VoiceCommand[] = ['up', 'down', 'cut', 'toggle_proximal', 'toggle_middle', 'toggle_distal'];
    const ctx = this.buildContext();
    const enabled = new Set<VoiceCommand>();
    for (const cmd of all) {
      if (validateCommand(this.state, cmd, ctx).allowed) enabled.add(cmd);
    }
    return enabled;
  }

  private syncUI(): void {
    this.ui.setState(this.state);
    this.ui.syncButtons(
      this.enabledCommands(),
      this.state === 'plane_active' || this.state === 'listening',
    );
  }

  private toggleMode(): void {
    if (this.state !== 'plane_active' && this.state !== 'listening') return;
    this.twoCutMode = !this.twoCutMode;
    this.ui.setTwoCutMode(this.twoCutMode);
    this.syncUI();
  }

  private movePlane(direction: 'up' | 'down'): void {
    const atLimit = direction === 'up' ? this.plane.isAtMax() : this.plane.isAtMin();

    if (atLimit && this.inactive && this.bone) {
      const iz = this.worldZOf(this.inactive);
      const az = this.worldZOf(this.bone);
      const shouldSwitch = direction === 'up' ? iz.min > az.min : iz.max < az.max;

      if (shouldSwitch) {
        this.switchToInactive(direction === 'up' ? 'min' : 'max');
        return;
      }
    }

    if (direction === 'up') this.plane.moveUp();
    else this.plane.moveDown();
    this.syncDash();
  }

  private executeCut(): boolean {
    if (!this.bone) return false;

    try {
      const oldBone = this.bone;
      const halves = cutMesh(oldBone, this.plane.getZ());
      this.disposeMesh(oldBone);
      this.placeCutResults(halves.proximal, halves.distal);
      return true;
    } catch (err) {
      console.error('Cut failed:', err);
      this.ui.setLastCommand('Cut failed');
      return false;
    }
  }

  private placeCutResults(proximal: THREE.Mesh, distal: THREE.Mesh): void {
    this.scene.add(proximal);
    this.scene.add(distal);

    if (this.state === 'first_cut_done') {
      proximal.position.z = SEGMENT_GAP;
      this.bone = distal;
      this.inactive = proximal;
      this.reattachPlane(this.bone);
      return;
    }

    if (this.twoCutMode) {
      this.assignThreeSegments(proximal, distal);
    } else {
      this.assignTwoSegments(proximal, distal);
    }

    this.bone = null;
  }

  private assignTwoSegments(proximal: THREE.Mesh, distal: THREE.Mesh): void {
    proximal.position.z = SEGMENT_GAP;
    distal.position.z = -SEGMENT_GAP;
    this.segments.proximal = proximal;
    this.segments.distal = distal;
  }

  private assignThreeSegments(proximal: THREE.Mesh, distal: THREE.Mesh): void {
    proximal.geometry.computeBoundingBox();
    distal.geometry.computeBoundingBox();

    const cutAboveInactive = proximal.geometry.boundingBox!.max.z >=
      (this.inactive?.geometry.boundingBox?.max.z ?? -Infinity);

    if (cutAboveInactive) {
      this.segments.proximal = proximal;
      this.segments.middle = distal;
      this.segments.distal = this.inactive;
    } else {
      this.segments.proximal = this.inactive;
      this.segments.middle = proximal;
      this.segments.distal = distal;
    }

    if (this.segments.proximal) this.segments.proximal.position.z = SEGMENT_GAP;
    if (this.segments.distal) this.segments.distal.position.z = -SEGMENT_GAP;
    this.inactive = null;
  }

  private reattachPlane(mesh: THREE.Mesh): void {
    mesh.geometry.computeBoundingBox();
    this.inactive?.geometry.computeBoundingBox();
    this.plane.recalculate(mesh.geometry.boundingBox!);
    this.dash = applyDashShader(mesh.material as THREE.MeshStandardMaterial);
    this.syncDash();
  }

  private toggleSegment(name: SegmentName): void {
    const mesh = this.segments[name];
    if (!mesh) return;
    mesh.visible = !mesh.visible;
  }

  dispose(): void {
    if (this.bone) this.disposeMesh(this.bone);
    if (this.inactive) this.disposeMesh(this.inactive);
    for (const seg of Object.values(this.segments)) {
      if (seg) this.disposeMesh(seg);
    }
    this.bone = null;
    this.inactive = null;
    this.segments = { proximal: null, middle: null, distal: null };
  }

  private switchToInactive(startAt: 'min' | 'max'): void {
    if (!this.bone || !this.inactive) return;
    this.dash.setDashVisible(false);
    [this.bone, this.inactive] = [this.inactive, this.bone];

    this.bone.geometry.computeBoundingBox();
    this.plane.recalculate(this.bone.geometry.boundingBox!);
    if (startAt === 'min') this.plane.setToMin();
    else this.plane.setToMax();

    this.dash = applyDashShader(this.bone.material as THREE.MeshStandardMaterial);
    this.syncDash();
  }

  private syncDash(): void {
    this.dash.setPlaneZ(this.plane.getZ() + (this.bone?.position.z ?? 0));
  }

  private worldZOf(mesh: THREE.Mesh): { min: number; max: number } {
    mesh.geometry.computeBoundingBox();
    const bb = mesh.geometry.boundingBox!;
    return { min: bb.min.z + mesh.position.z, max: bb.max.z + mesh.position.z };
  }

  private disposeMesh(mesh: THREE.Mesh): void {
    this.scene.remove(mesh);
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  }
}
