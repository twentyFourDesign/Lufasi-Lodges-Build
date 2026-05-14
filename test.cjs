const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() !== 'warning' && !msg.text().includes('React DevTools')) {
      console.log('PAGE LOG:', msg.text());
    }
  });

  // Navigate to new booking
  await page.goto('http://localhost:5173/new-booking', {waitUntil: 'networkidle0'});
  
  // Click the dates input to open the date picker (stayOpen)
  // Wait, the button "Change dates" or the date picker?
  // Let's just evaluate a script to call setStayDates directly because UI clicking is hard.
  
  await page.evaluate(() => {
    // We can't access setStayDates directly.
    // Let's trigger the click on the "Change dates" button
  });
  
  const changeDatesBtn = await page.$('button.border-[#0F5B45]'); // "Change dates"
  if (changeDatesBtn) {
    await changeDatesBtn.click();
    console.log("Clicked Change dates");
  } else {
    // Maybe the date picker is already open?
    console.log("Change dates button not found");
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Now we need to click "Check Availability" which is the button with text "Check Availability"
  const checkBtn = await page.$x("//button[contains(text(), 'Check Availability')]");
  if (checkBtn.length > 0) {
    // Before clicking, the dates must be selected.
    // The UI requires clicking on the calendar. This is hard to script.
  }
  
  // Alternative: let's inject a script that accesses useBookingStore and calls checkPodAvalability
  await page.evaluate(() => {
    window.__checkPodAvalability = async () => {
       // We can't access the component's useCallback easily.
       // But we CAN intercept the fetch response if we just do a fetch? No.
    };
  });
  
  await browser.close();
})();
