const scraperObject = {
  url: 'https://www.mebehliyetsinavsorulari.com/ehliyet-sinav-sorulari-nisan-2021.html',
  async scraper(browser){
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);

    await page.goto(this.url)
    await page.waitForSelector('#content');

    let urls = await page.$$eval('tbody tr a', links => {
        links = links.map(el => el.href)
        return links;
    });

    let pagePromise = (link) => new Promise(async(resolve, reject) => {
        let dataObj = {};
        let newPage = await browser.newPage();

        await newPage.goto(link);
        await newPage.waitForSelector('.items');

        let questionCount = await newPage.evaluate(() => {
          return document.querySelectorAll('.mtq_question').length;
        });

        console.log("questionCount", questionCount);

        for (let i = 1; i < questionCount+1; i++) {
          await newPage.waitForSelector('#mtq_question-'+i+'-1 .mtq_question_text');

          let question = await newPage.$eval('#mtq_question-'+i+'-1 .mtq_question_text', text => text.textContent);
          
          let answers = await newPage.evaluate((i) => {
            let answers = [];
            let count = document.querySelectorAll('#mtq_question-'+i+'-1 .mtq_answer_text');
            for (let a = 0; a < count.length; a++) {
              answers.push(count[a].textContent);
            }
            return answers;
          });

          let rightAnswer = await newPage.evaluate((i) => {
            // document.querySelector('#mtq_question-'+i+'-1 .mtq_clickable').click();
            return document.querySelector('#mtq_question-'+i+'-1 .mtq_correct_marker').previousElementSibling.textContent;
          });

          let dataObj = {
            question: question,
            answers: answers,
            rightAnswer: rightAnswer
          }

          console.log("dataObj", dataObj);
          return;
        }

        //resolve(dataObj);
        //await newPage.close();
    });

    for(link in urls){
      let currentPageData = await pagePromise(urls[link]);
      // scrapedData.push(currentPageData);
      console.log(currentPageData);
    }  
  }
}

module.exports = scraperObject;