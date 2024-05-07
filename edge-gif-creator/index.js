const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

function createGif(inputMp4, startTimestamp, endTimestamp) {
  const outputFolder = path.join(__dirname, "gif");
  const randomGifNo = Math.floor(Math.random() * 90000) + 10000;
  const outputFileName = path.join(outputFolder, `GIF_${randomGifNo}.gif`);
  const logoPath = path.join(__dirname, "logo", "logo.jpg");
  const command = `ffmpeg -ss ${startTimestamp} -to ${endTimestamp} -i ${inputMp4} -i ${logoPath} -filter_complex "[0:v]scale=380:-1[trimmed_video];[trimmed_video][1:v]overlay=W-w-10:H-h-10" -crf 25 -r 12 -pix_fmt yuv420p "${outputFileName}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error creating GIF: ${error}`);
    }
    if (stderr) {
      console.error(`ffmpeg stderr ${stderr}`);
    }

    console.log("GIF created Successfully");
  });
}

const args = process.argv.slice(2);

if (args.length != 3) {
  console.log(
    "Please enter the following: <input_file> <start timestamp in seconds> <end timestamp in seconds>"
  );
  process.exit(1);
}

const inputFile = args[0];
const startTime = args[1];
const endTime = args[2];

if (!fs.existsSync(inputFile)) {
  console.error(`file: ${inputFile} doesn't exist`);
  process.exit(1);
}

if (isNaN(startTime) || isNaN(endTime)) {
  console.error("Please enter valid starting and ending timestamps");
  process.exit(1);
}

if (startTime >= endTime) {
  console.error("End timestamp has to be greater than start timestamp");
  process.exit(1);
}

createGif(inputFile, startTime, endTime);
