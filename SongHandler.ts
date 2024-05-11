import Sound from 'react-native-sound';

class SongHandler {
  static sound: Sound | null = null;
  static currentTime: number = 0;
  static init = () => {
    if (!this.sound) {
      this.sound = new Sound('song', Sound.MAIN_BUNDLE, error => {
        if (error) {
          return;
        }
        this.sound
          ?.play(scuess => {
            if (scuess) {
              this.sound?.stop();
              this.sound?.release();
              this.sound = null;
            }
          })
          .setNumberOfLoops(-1);
      });
    } else {
      this.resume();
    }
  };

  static resume = () => {
    this.sound?.setCurrentTime(this.currentTime).play().setNumberOfLoops(-1);
  };

  static stop = () => {
    this.sound?.stop();
    this.sound?.getCurrentTime(s => {
      this.currentTime = s;
    });
  };
}
export default SongHandler;
