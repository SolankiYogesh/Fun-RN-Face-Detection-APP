import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  CameraPosition,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from 'react-native-vision-camera';
import {Camera, Face} from 'react-native-vision-camera-face-detector';
import {
  Canvas,
  RoundedRect,
  Shadow,
  useImage,
  Image,
} from '@shopify/react-native-skia';
import {useSharedValue, withTiming} from 'react-native-reanimated';
import SongHandler from './SongHandler';

function App(): React.JSX.Element {
  const {width, height} = useWindowDimensions();
  const {hasPermission, requestPermission} = useCameraPermission();
  const [position, setPosition] = useState<CameraPosition>('front');
  const device = useCameraDevice(position);
  const facesRef = useRef<Face[]>([]);
  const aFaceW = useSharedValue(0);
  const aFaceH = useSharedValue(0);
  const aFaceX = useSharedValue(0);
  const aFaceY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const warnColor = useSharedValue('red');
  const image = useImage(require('./joker.png'));
  const isCalled = useRef(false);
  const isCalledStop = useRef(false);

  const format = useCameraFormat(device, [
    {
      videoResolution: {height, width},
    },
    {
      fps: 60,
    },
    {
      videoStabilizationMode: 'cinematic',
    },
  ]);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const flipCamera = useCallback(() => {
    setPosition(pos => (pos === 'front' ? 'back' : 'front'));
  }, []);

  const onFaceDetected = useCallback((detect: boolean) => {
    console.log('detect', detect, Date.now());
    if (detect) {
      isCalledStop.current = false;
      isCalled.current = true;
      SongHandler.init();
    } else {
      isCalledStop.current = true;
      isCalled.current = false;
      SongHandler.stop();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} onTouchEnd={flipCamera}>
      <StatusBar backgroundColor={'transparent'} translucent />
      {hasPermission ? (
        device != null ? (
          <Camera
            faceDetectionCallback={faces => {
              facesRef.current = faces;

              if (faces[0]) {
                warnColor.value = '#16d42676';
                opacity.value = 1;
                aFaceW.value = withTiming(faces[0].bounds.width, {
                  duration: 200,
                });
                aFaceH.value = withTiming(faces[0].bounds.height, {
                  duration: 200,
                });
                aFaceX.value = withTiming(faces[0].bounds.x, {
                  duration: 200,
                });
                aFaceY.value = withTiming(faces[0].bounds.y, {
                  duration: 200,
                });
                if (!isCalled.current) {
                  onFaceDetected(true);
                }
              } else {
                opacity.value = 0;
                warnColor.value = '#FB070776';
                if (!isCalledStop.current) {
                  onFaceDetected(false);
                }
              }
            }}
            faceDetectionOptions={{
              contourMode: 'all',
              performanceMode: 'accurate',
              autoScale: true,
              classificationMode: 'all',
              landmarkMode: 'all',
              trackingEnabled: true,
            }}
            style={StyleSheet.absoluteFill}
            isActive={true}
            device={device}
            format={format}
            fps={format?.maxFps}
            pixelFormat="rgb"
          />
        ) : (
          <View style={styles.textContainer}>
            <Text style={styles.text}>
              Your phone does not have a {position} Camera.
            </Text>
          </View>
        )
      ) : (
        <View style={styles.textContainer}>
          <Text style={styles.text} numberOfLines={5}>
            FaceBlurApp needs Camera permission.
            <Text style={styles.link} onPress={Linking.openSettings}>
              Grant
            </Text>
          </Text>
        </View>
      )}
      <Canvas style={styles.container}>
        <Image
          image={image}
          x={aFaceX}
          y={aFaceY}
          width={aFaceW}
          height={aFaceH}
          opacity={opacity}
          fit="contain"
        />
        <Image
          image={image}
          x={width - 100}
          y={height - 100}
          width={50}
          height={50}
          fit="contain"
        />
        <RoundedRect
          x={width - 100}
          y={height - 100}
          width={50}
          height={50}
          r={300}
          color={warnColor}>
          <Shadow dx={12} dy={12} blur={25} color={warnColor} />
          <Shadow dx={-12} dy={-12} blur={25} color={warnColor} />
        </RoundedRect>
      </Canvas>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...Dimensions.get('screen'),
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    maxWidth: '60%',
    fontWeight: 'bold',
    fontSize: 15,
    color: 'black',
  },
  link: {
    color: 'rgb(80, 80, 255)',
  },
});

export default App;
