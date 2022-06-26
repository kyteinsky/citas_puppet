# CITAS Website Automation Tool

This tool checks if appointments are available every 10 minutes because the website is too shit to report available slots itself.

*citas.sre.gob.mx*

## How To

Rename the `.env.example` file to `.env` and set your own credentials

For the ntfy topic you can choose any name and download the [ntfy app](https://ntfy.sh/)
to receive notifications on your mobile device.

Now just do a quick npm package install with `npm i` and run the script as `node main.js`

**Note: HEADLESS_MODE inside .env file can be changed to true to view the browser window and ongoing functions in real-time**
