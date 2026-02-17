export interface PeerServerConfig {
  port: number;
  path: string;
  secure: boolean;
  sslKey?: string;
  sslCert?: string;
  allowedOrigins: string[];
  corsOptions?: {
    origin: string | string[];
    credentials: boolean;
  };
}

export interface PeerConnection {
  id: string;
  connectedAt: Date;
  lastActivity: Date;
}
