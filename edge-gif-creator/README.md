# Node GIF creator script

The script `index.js` takes input of a video file in 'MP4' format, a starting timestamp and an ending timestamp.
It converts the video file in a gif with Edge Video logo added to the bottom right.

## Usage

First of all make sure that you have node and npm installed.

Then you need to install ffmpeg command-line tool on your local machine.
[learn more](https://ffmpeg.org/)

After installing ffmpeg clone this repository and initialize a node project and install all the dependencies by using

`npm install`

Then you need to run the script as follows:

`node index.js <video file name> <start timestamp in seconds> <end timestamp in seconds>`

Example:

`node index.js video/cats.mp4 12 20`

## Memory and process speed management

I used four methods to minimize memory usage and maximize process speed. However, you can change the `ffmpeg` command to your requirements. The usage of these methods depends heavily on your requirements and use-case.

### Limiting GIF length to 10 seconds

The first method I used was to limit the length of the GIF to 10 seconds. For even better memory management and a better process speed you can lower this number here:

```if (Math.abs(endTime - startTime) > 10) { console.error("The GIF must not be longer than 10 seconds"); process.exit(1); }```

Drawback here is that you may end-up with a very short gif. Again this depends on your use-case.

### Lowering the GIF resolution

The second method I use was to lower the GIF's resolution down to 380 pixels in my `ffmpeg` command. A lowered resolution directly results in a bette memory management and effective process speed. You can change the resolution here at line '26'

```...-filter_complex "[0:v]scale=380:-1[trimmed_video]...```

Drawback here is that you may end-up with an ugly looking GIF if you lower the resolution too much.

### CRF adjustment

It may not have a lot of effect on short GIFs but adjusting the "CRF" or Constant Rate Factor. CRF is a quality-based encoding method that adjusts the compression to maintain a consistent level of perceived quality. A higher CRF value results in lower quality and smaller file size. You can adjust CRF here in line '26'

```...-crf 25...```

### Lowering the Framerate

I also lowered the framerate of the GIF to 12 frames-per-second, you can also adjust it as you like, it depends on your requirements and Use-cases. Framerate is adjusted here at line 26

```...-r 12...```

Drawback with lower framerate is that you may end-up with a low quality GIF. Again this depends on your requirements.