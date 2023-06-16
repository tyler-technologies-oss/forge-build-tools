export interface IPackageJson {
  [key: string]: any;
  name: string;
  description?: string;
  version: string;
  publishConfig?: IPackagJsonPublishConfig;
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
  peerDependencies?: { [key: string]: string };
}

export interface IPackagJsonPublishConfig {
  registry?: string;
}
