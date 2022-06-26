/**
 * Repeatedly check for the availability of the office
 * Copyright (C) 2022 kyte
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

"use strict";

import puppeteer from "puppeteer";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  const { EMAIL, PASSWORD, HEADLESS_MODE } = process.env;
  const headless = HEADLESS_MODE === "true";

  const browser = await puppeteer.launch({ headless });
  const page = await browser.newPage();
  await page.goto("https://citas.sre.gob.mx/");
  await page.waitForNetworkIdle();
  await page.waitForSelector("#subenlaces > ul:nth-child(3) > a");

  // // click on EN
  await page.click("#subenlaces > ul:nth-child(3) > a");
  await page.waitForTimeout(2000);

  // // click on 'Consular Office Abroad' button
  await page.waitForSelector(
    "body > div:nth-child(3) > div > main > div > div > div > div > div:nth-child(1) > div > div > div > div > div > div > div > div.container-fluid.h-100 > div > div > div > button:nth-child(2)"
  );
  await page.click(
    "body > div:nth-child(3) > div > main > div > div > div > div > div:nth-child(1) > div > div > div > div > div > div > div > div.container-fluid.h-100 > div > div > div > button:nth-child(2)"
  );

  await page.waitForTimeout(2000);

  // enter email and password
  await page.waitForSelector(
    "body > div:nth-child(3) > div > main > div > div > div > div > div.col-md-3 > div:nth-child(2) > div:nth-child(2) > div > div > div > div.example > form > div:nth-child(1) > div > input"
  );
  await page.type(
    "body > div:nth-child(3) > div > main > div > div > div > div > div.col-md-3 > div:nth-child(2) > div:nth-child(2) > div > div > div > div.example > form > div:nth-child(1) > div > input",
    EMAIL
  );

  await page.waitForSelector(
    "body > div:nth-child(3) > div > main > div > div > div > div > div.col-md-3 > div:nth-child(2) > div:nth-child(2) > div > div > div > div.example > form > div:nth-child(2) > div > input"
  );
  await page.type(
    "body > div:nth-child(3) > div > main > div > div > div > div > div.col-md-3 > div:nth-child(2) > div:nth-child(2) > div > div > div > div.example > form > div:nth-child(2) > div > input",
    PASSWORD
  );

  // check the Terms and Conditions checkbox
  await page.waitForSelector(
    "body > div:nth-child(3) > div > main > div > div > div > div > div.col-md-3 > div:nth-child(2) > div:nth-child(2) > div > div > div > div.example > form > div:nth-child(4) > div > div > label > input[type=checkbox]"
  );
  await page.click(
    "body > div:nth-child(3) > div > main > div > div > div > div > div.col-md-3 > div:nth-child(2) > div:nth-child(2) > div > div > div > div.example > form > div:nth-child(4) > div > div > label > input[type=checkbox]"
  );

  // dismiss the TNC modal
  await removeModal(page);

  // press the submit button
  await page.waitForSelector(
    "body > div:nth-child(3) > div > main > div > div > div > div > div.col-md-3 > div:nth-child(2) > div:nth-child(3) > div > div > div > div.example > form > div:nth-child(6) > div > div > div:nth-child(2) > button"
  );
  await page.click(
    "body > div:nth-child(3) > div > main > div > div > div > div > div.col-md-3 > div:nth-child(2) > div:nth-child(3) > div > div > div > div.example > form > div:nth-child(6) > div > div > div:nth-child(2) > button"
  );

  // wait for the page to load
  await page.waitForNavigation();

  // remove another modal
  await removeModal(page);

  // click on Schedule button
  await page.evaluate(() =>
    document
      .querySelector(
        "body > div:nth-child(3) > div.container > div:nth-child(3) > div:nth-child(5) > a"
      )
      .click()
  );

  await page.waitForNavigation();

  let success = false;
  while (!success) {
    // check every 2 secs
    await page.waitForTimeout(2000);
    success = await isOfficeAvailable(page);

    if (!success) {
      // // click on cancel
      // await page.evaluate(() =>
      //   document
      //     .querySelector(
      //       "body > div:nth-child(3) > div.container > div:nth-child(3) > div > div > div > div:nth-child(2) > div:nth-child(2) > div > button.btn.btn-default"
      //     )
      //     .click()
      // );

      // wait 5 min before retry
      await page.waitForTimeout(5 * 60 * 1000);

      // refresh the page
      await page.reload();

      // wait for navigation
      await page.waitForTimeout(2000);
    }
  }

  // await page.waitForTimeout(10000);
  // await browser.close();
})();

async function removeModal(page) {
  await page.evaluate(() => {
    const MODal = document.querySelector(".modal-mask");
    if (MODal) MODal.remove();
  });
}

async function isDropDownPopulated(page) {
  let return_value = undefined;

  await page.evaluate(() => {
    const ddown = document.querySelector("#vs3__listbox");

    if (
      ddown.children.length > 0 &&
      !ddown.children[0].className == "vs__no-options"
    )
      return_value = true;
    else return_value = false;
  });

  return return_value;
}

async function isOfficeAvailable(page) {
  // remove another modal
  await removeModal(page);

  // wait for the thing to load
  await page.waitForNetworkIdle();
  await page.waitForTimeout(3000);

  // click on the Consular Office dropdown
  // await page.waitForSelector(
  //   "#vs3__combobox > div.vs__selected-options > input"
  // );
  await page.click("#vs3__combobox > div.vs__selected-options > input");

  // wait for the dropdown to load
  await page.waitForTimeout(1000);

  // check available offices
  const isAvailable = await isDropDownPopulated(page);
  if (isAvailable) {
    console.log(`
      =============================================
      AVAILABLE !!!!!
      =============================================
    `);
    sendNotification();
    return true;
  } else console.log(`tried at ${new Date().toISOString()}`);

  return false;
}

async function sendNotification() {
  if (!process.env.NTFY_TOPIC) return;

  const res = await fetch(`https://ntfy.sh/${process.env.NTFY_TOPIC}`, {
    method: "POST",
    headers: {
      Title: "hehe mecico",
      Priority: "urgent",
      Tags: "loudspeaker,rotating_light,partying_face",
    },
    body: "Mexico Slots Available!!",
  });

  console.log("res=", res.status);
}
