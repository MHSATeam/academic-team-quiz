const { writeFile } = require("fs");
const puppeteer = require("puppeteer");
const prettier = require("prettier");
var idIndex = 0;
async function scrapeQuizletPage(pageUrl) {
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 60000,
    args: [
      "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
      "--window-size=1200,800",
    ],
  });
  const page = await browser.newPage();
  var termList;
  try {
    await page.goto(pageUrl);
    console.log("Opened Quizlet");
    await page.type("input.UIInput-input", "yoda");

    (await page.$("button.UIButton")).click();
    console.log("Clicked log in");
    await page.waitForNavigation({
      waitUntil: "domcontentloaded",
    });
    console.log("Page Loaded");
    await page.waitForSelector(".SetPage-titleWrapper");
    console.log("Title loaded");
    await page.waitForSelector(".MiniFlashcards");
    console.log("Flashcards loaded");
    await page.evaluate(() => {
      window.scrollBy(0, 1000);
    });
    await page.waitForSelector("section.SetPageTerms-termsList");
    console.log("Found terms");

    termList = await page.evaluate((idIndex) => {
      const termSelctor = ".SetPage-terms .SetPageTerm-content";
      return [...document.querySelectorAll(termSelctor)].reduce((arr, node) => {
        var defTerm = [...node.querySelectorAll("span.TermText")].map(
          (span) => span.textContent
        );
        if (defTerm.length === 2) {
          arr.push({
            id: idIndex++,
            definition: defTerm[0],
            term: defTerm[1],
          });
        }
        return arr;
      }, []);
    }, idIndex);
    idIndex = termList[termList.length - 1].id + 1;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    await browser.close();
  }
  return termList;
}

/**
 * @type {{name: String, url: String}[]}
 */
const quizlets = [
  {
    name: "American History (Old)",
    url: "https://quizlet.com/578338897/american-history-old-flash-cards/",
  },
  {
    name: "American History (Hard)",
    url: "https://quizlet.com/578338682/american-history-hard-flash-cards/",
  },
  {
    name: "Physical Science (All)",
    url: "https://quizlet.com/578338499/physical-science-all-flash-cards/",
  },
  {
    name: "Physical Science (Hard)",
    url: "https://quizlet.com/578338363/physical-science-hard-flash-cards/",
  },
  {
    name: "Geography (All)",
    url: "https://quizlet.com/578338168/geography-all-flash-cards/",
  },
  {
    name: "Geography (Hard)",
    url: "https://quizlet.com/578338168/geography-hard-flash-cards/",
  },
  {
    name: "American Government/Economics (All)",
    url: "https://quizlet.com/578337646/american-government-economics-all-flash-cards/",
  },
  {
    name: "American Government/Economics (Hard)",
    url: "https://quizlet.com/578337535/american-government-economics-hard-flash-cards/",
  },
  {
    name: "World Literature (All)",
    url: "https://quizlet.com/578337098/world-literature-all-flash-cards/",
  },
  {
    name: "World Literature (Hard)",
    url: "https://quizlet.com/578336979/world-literature-hard-flash-cards/",
  },
  {
    name: "Life Science (All)",
    url: "https://quizlet.com/578336599/life-science-all-flash-cards/",
  },
  {
    name: "Life Science (Hard)",
    url: "https://quizlet.com/578336382/life-science-hard-flash-cards/",
  },
  {
    name: "Fine Arts (All)",
    url: "https://quizlet.com/578336223/fine-arts-all-flash-cards/",
  },
  {
    name: "Fine Arts (Hard)",
    url: "https://quizlet.com/578336133/fine-arts-hard-flash-cards/",
  },
  {
    name: "World History (All)",
    url: "https://quizlet.com/578336038/world-history-all-flash-cards/",
  },
  {
    name: "World History (Hard)",
    url: "https://quizlet.com/578336038/world-history-hard-flash-cards/",
  },
  {
    name: "Math (All)",
    url: "https://quizlet.com/578335699/math-all-flash-cards/",
  },
  {
    name: "Math (Hard)",
    url: "https://quizlet.com/578335699/math-hard-flash-cards/",
  },
  {
    name: "American Literature (All)",
    url: "https://quizlet.com/578335010/american-literature-all-flash-cards/",
  },
  {
    name: "American Literature (Hard)",
    url: "https://quizlet.com/578335010/american-literature-hard-flash-cards/",
  },
];
(async () => {
  for (const quizlet of quizlets) {
    console.log('Scraping the "' + quizlet.name + '" quizlet...');
    console.log("Current ID index: " + idIndex);
    try {
      const data = await scrapeQuizletPage(quizlet.url);
      await new Promise((resolve) => {
        writeFile(
          "./data/" +
            quizlet.name
              .toLowerCase()
              .replaceAll("/", " and ")
              .replaceAll(" ", "-") +
            ".json",
          prettier.format(JSON.stringify(data), {
            parser: "json",
          }),
          () => resolve()
        );
      });
    } catch (e) {
      console.log(e);
      console.log('Failed to scrape quizlet "' + quizlet.name + '"');
    }
  }
})();
