import { PostureStatus, TurtleNeckData, NailBitingData } from '@/types/posture';
import { Keypoint } from '@tensorflow-models/posenet';

export class PostureAnalyzer {
  
  analyzeTurtleNeck(keypoints: Keypoint[], sensitivity: number = 7): TurtleNeckData {
    // Find relevant keypoints
    const nose = keypoints.find(kp => kp.part === 'nose');
    const leftShoulder = keypoints.find(kp => kp.part === 'leftShoulder');
    const rightShoulder = keypoints.find(kp => kp.part === 'rightShoulder');
    const leftEar = keypoints.find(kp => kp.part === 'leftEar');
    const rightEar = keypoints.find(kp => kp.part === 'rightEar');

    if (!nose || !leftShoulder || !rightShoulder || !leftEar || !rightEar) {
      return {
        neckAngle: 0,
        shoulderAngle: 0,
        isDetected: false,
        confidence: 0
      };
    }

    // Calculate average shoulder position
    const shoulderY = (leftShoulder.position.y + rightShoulder.position.y) / 2;
    const shoulderX = (leftShoulder.position.x + rightShoulder.position.x) / 2;
    
    // Calculate average ear position
    const earY = (leftEar.position.y + rightEar.position.y) / 2;
    const earX = (leftEar.position.x + rightEar.position.x) / 2;

    // Calculate neck forward angle
    const neckVector = {
      x: nose.position.x - earX,
      y: nose.position.y - earY
    };

    const shoulderVector = {
      x: 0,
      y: shoulderY - earY
    };

    // Calculate angle between neck and vertical
    const neckAngle = Math.atan2(neckVector.x, neckVector.y) * 180 / Math.PI;
    
    // Calculate shoulder slope
    const shoulderAngle = Math.atan2(
      rightShoulder.position.y - leftShoulder.position.y,
      rightShoulder.position.x - leftShoulder.position.x
    ) * 180 / Math.PI;

    // Determine if turtle neck is detected based on sensitivity
    const threshold = 15 + (10 - sensitivity) * 2; // Higher sensitivity = lower threshold
    const isDetected = Math.abs(neckAngle) > threshold;
    
    // Calculate confidence based on keypoint scores
    const confidence = Math.min(
      nose.score,
      leftShoulder.score,
      rightShoulder.score,
      leftEar.score,
      rightEar.score
    );

    return {
      neckAngle,
      shoulderAngle,
      isDetected,
      confidence
    };
  }

  analyzeNailBiting(keypoints: Keypoint[], sensitivity: number = 5): NailBitingData {
    // Find relevant keypoints
    const nose = keypoints.find(kp => kp.part === 'nose');
    const leftWrist = keypoints.find(kp => kp.part === 'leftWrist');
    const rightWrist = keypoints.find(kp => kp.part === 'rightWrist');

    if (!nose || (!leftWrist && !rightWrist)) {
      return {
        handToFaceDistance: 0,
        isDetected: false,
        confidence: 0
      };
    }

    // Calculate distances from both hands to face
    let minDistance = Infinity;
    let maxConfidence = 0;

    if (leftWrist && leftWrist.score > 0.5) {
      const leftDistance = Math.sqrt(
        Math.pow(leftWrist.position.x - nose.position.x, 2) +
        Math.pow(leftWrist.position.y - nose.position.y, 2)
      );
      if (leftDistance < minDistance) {
        minDistance = leftDistance;
        maxConfidence = Math.min(nose.score, leftWrist.score);
      }
    }

    if (rightWrist && rightWrist.score > 0.5) {
      const rightDistance = Math.sqrt(
        Math.pow(rightWrist.position.x - nose.position.x, 2) +
        Math.pow(rightWrist.position.y - nose.position.y, 2)
      );
      if (rightDistance < minDistance) {
        minDistance = rightDistance;
        maxConfidence = Math.min(nose.score, rightWrist.score);
      }
    }

    // Determine if nail biting is detected based on sensitivity
    const threshold = 150 - (sensitivity - 1) * 15; // Higher sensitivity = larger threshold
    const isDetected = minDistance < threshold && minDistance !== Infinity;

    return {
      handToFaceDistance: minDistance === Infinity ? 0 : minDistance,
      isDetected,
      confidence: maxConfidence
    };
  }

  analyzePosture(
    keypoints: Keypoint[],
    turtleNeckSensitivity: number,
    nailBitingSensitivity: number,
    turtleNeckEnabled: boolean,
    nailBitingEnabled: boolean
  ): PostureStatus {
    let status: PostureStatus = "good";

    if (turtleNeckEnabled) {
      const turtleNeckData = this.analyzeTurtleNeck(keypoints, turtleNeckSensitivity);
      if (turtleNeckData.isDetected && turtleNeckData.confidence > 0.5) {
        status = "turtle_neck";
      }
    }

    if (nailBitingEnabled) {
      const nailBitingData = this.analyzeNailBiting(keypoints, nailBitingSensitivity);
      if (nailBitingData.isDetected && nailBitingData.confidence > 0.5) {
        status = "nail_biting";
      }
    }

    return status;
  }
}

export const postureAnalyzer = new PostureAnalyzer();
