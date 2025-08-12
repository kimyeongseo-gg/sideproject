import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';

export class PoseDetection {
  private model: posenet.PoseNet | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load TensorFlow.js
      await tf.ready();
      
      // Load PoseNet model
      this.model = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75,
      });
      
      this.isInitialized = true;
      console.log('PoseNet model loaded successfully');
    } catch (error) {
      console.error('Failed to initialize PoseNet:', error);
      throw error;
    }
  }

  async detectPose(videoElement: HTMLVideoElement): Promise<posenet.Pose | null> {
    if (!this.model || !this.isInitialized) {
      throw new Error('PoseNet model not initialized');
    }

    try {
      const pose = await this.model.estimateSinglePose(videoElement, {
        flipHorizontal: false,
      });
      
      return pose;
    } catch (error) {
      console.error('Error detecting pose:', error);
      return null;
    }
  }

  drawKeypoints(
    canvas: HTMLCanvasElement,
    keypoints: posenet.Keypoint[],
    minConfidence: number = 0.5
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw keypoints
    keypoints.forEach((keypoint) => {
      if (keypoint.score >= minConfidence) {
        ctx.beginPath();
        ctx.arc(keypoint.position.x, keypoint.position.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#4F46E5';
        ctx.fill();
      }
    });

    // Draw skeleton
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, minConfidence);
    
    adjacentKeyPoints.forEach((keypoints) => {
      ctx.beginPath();
      ctx.moveTo(keypoints[0].position.x, keypoints[0].position.y);
      ctx.lineTo(keypoints[1].position.x, keypoints[1].position.y);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#06B6D4';
      ctx.stroke();
    });
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isInitialized = false;
    }
  }
}

export const poseDetection = new PoseDetection();
