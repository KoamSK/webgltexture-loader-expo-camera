"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _webgltextureLoader = require("webgltexture-loader");

var _reactNative = require("react-native");

var _core = require("@unimodules/core");

var _expoCamera = require("expo-camera");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const neverEnding = new Promise(() => {});
const available = !!(_core.NativeModulesProxy.ExponentGLObjectManager && _core.NativeModulesProxy.ExponentGLObjectManager.createCameraTextureAsync);
let warned = false;

class ExpoCameraTextureLoader extends _webgltextureLoader.WebGLTextureLoaderAsyncHashCache {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "objIds", new WeakMap());
  }

  canLoad(input) {
    if (input && input instanceof _expoCamera.Camera) {
      if (available) return true;

      if (!warned) {
        warned = true;
        console.log("webgltexture-loader-expo: ExponentGLObjectManager.createCameraTextureAsync is not available. Make sure to use the correct version of Expo");
      }
    }

    return false;
  }

  disposeTexture(texture) {
    const exglObjId = this.objIds.get(texture);

    if (exglObjId) {
      _core.NativeModulesProxy.ExponentGLObjectManager.destroyObjectAsync(exglObjId);
    }

    this.objIds.delete(texture);
  }

  inputHash(camera) {
    return (0, _reactNative.findNodeHandle)(camera);
  }

  loadNoCache(camera) {
    const {
      gl
    } = this; // $FlowFixMe

    const {
      __exglCtxId: exglCtxId
    } = gl;
    let disposed = false;

    const dispose = () => {
      disposed = true;
    };

    const glView = gl.getExtension("GLViewRef");
    const promise = !glView ? Promise.reject(new Error("GLViewRef not available")) : glView.createCameraTextureAsync(camera).then(texture => {
      if (disposed) return neverEnding; // $FlowFixMe

      this.objIds.set(texture, texture.exglObjId);
      const width = 0;
      const height = 0; // ^ any way to retrieve these ?

      return {
        texture,
        width,
        height
      };
    });
    return {
      promise,
      dispose
    };
  }

}

_defineProperty(ExpoCameraTextureLoader, "priority", -199);

_webgltextureLoader.globalRegistry.add(ExpoCameraTextureLoader);

var _default = ExpoCameraTextureLoader;
exports.default = _default;
//# sourceMappingURL=ExpoCameraTextureLoader.js.map