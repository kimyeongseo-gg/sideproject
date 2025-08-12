export type PostureStatus = "good" | "turtle_neck" | "nail_biting";

export interface PostureData {
  status: PostureStatus;
  confidence: number;
  timestamp: number;
}

export interface TurtleNeckData {
  neckAngle: number;
  shoulderAngle: number;
  isDetected: boolean;
  confidence: number;
}

export interface NailBitingData {
  handToFaceDistance: number;
  isDetected: boolean;
  confidence: number;
}

export interface PostureStats {
  goodPostureTime: number;
  turtleNeckWarnings: number;
  nailBitingWarnings: number;
  totalWarnings: number;
  streak: number;
  sessionStartTime: Date;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  visualEnabled: boolean;
  frequency: "immediate" | "5s" | "10s" | "30s";
}

export interface DetectionSettings {
  turtleNeckEnabled: boolean;
  nailBitingEnabled: boolean;
  turtleNeckSensitivity: number;
  nailBitingSensitivity: number;
}
