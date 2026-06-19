import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  console.log("Navigating to /admin/users...");
  await page.goto("http://localhost:5173/admin/users", {
    waitUntil: "networkidle0",
  });

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log("BODY TEXT:", bodyText);

  if (bodyText.includes("404")) {
    console.log("FOUND 404 ERROR!");
  } else {
    console.log("NO 404 FOUND.");
  }

  await browser.close();
})();
