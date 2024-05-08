const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

/**
 * This function creates a GIF from a given mp4 video file
 * @param inputMp4 The input file in ".mp4" format
 * @param startTimestamp The starting timestamp from which the gif will be generated
 * @param endTimestamp The ending timestamp at which the gif stops
 *
 * @dev The function uses the ffmpeg CL tool to process multimedia. The ffmpeg command is created and then executed
 * asynchronously using 'exec' function from child_processes module.
 * The function is optimized for minimal memory usage and speed. Consult README.md in the package.
 */
function createGif(inputMp4, startTimestamp, endTimestamp) {
  const outputFolder = path.join(__dirname, "gif");

  //Random number is generated and alloted to the GIF file to prevent file name clashes
  const randomGifNo = Math.floor(Math.random() * 90000) + 10000;
  const outputFileName = path.join(outputFolder, `GIF_${randomGifNo}.gif`);

  //Accessing the logo
  const logoPath = path.join(__dirname, "logo", "logo.jpg");

  //The ffmpeg command to trim the video between timestamps adds a logo on top at defined width and height and converts it into a GIF. (open README.MD for more info)
  const command = `ffmpeg -ss ${startTimestamp} -to ${endTimestamp} -i ${inputMp4} -i ${logoPath} -filter_complex "[0:v]scale=380:-1[trimmed_video];[trimmed_video][1:v]overlay=W-w-10:H-h-10" -crf 25 -r 12 -pix_fmt yuv420p "${outputFileName}"`;

  //The exec function of child_processes module executes the command and calls a 'callback' function to handle the execution results
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

//Command line args
const args = process.argv.slice(2);

//Checks if the CL arguments are of appropriate length
if (args.length != 3) {
  console.log(
    "Please enter the following: <input_file> <start timestamp in seconds> <end timestamp in seconds>"
  );
  process.exit(1);
}

//Defines the arguments
const inputFile = args[0];
const startTime = args[1];
const endTime = args[2];

//Checks if the input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`file: ${inputFile} doesn't exist`);
  process.exit(1);
}

//Checks if the input file is in mp4 format or not.
if (!inputFile.toLowerCase().endsWith(".mp4")) {
  console.error("Input file must be in MP4 format");
  process.exit(1);
}

//Checks if the user has entered valid timestamps
if (isNaN(startTime) || isNaN(endTime)) {
  console.error("Please enter valid starting and ending timestamps");
  process.exit(1);
}

//Checks if the timestamps are appropriate
if (startTime >= endTime) {
  console.error("End timestamp has to be greater than start timestamp");
  process.exit(1);
}

//Check for GIF length
if (Math.abs(endTime - startTime) > 10) {
  console.error("The GIF must not be longer than 10 seconds");
  process.exit(1);
}

createGif(inputFile, startTime, endTime);
