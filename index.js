const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

async function getPriceFeed() {
  try {
    const siteUrl = "https://coinmarketcap.com/";

    const { data } = await axios({
      method: "GET",
      url: siteUrl,
    });

    const $ = cheerio.load(data);
    // console.log($);

    const keys = [
      "rank",
      "name",
      "price",
      "24hr",
      "7hr",
      "marketCap",
      "volume",
      "circulatingSupply",
    ];

    const coinArr = [];

    const elemSelector = ".h7vnx2-2 > tbody:nth-child(3) > tr";
    // const elemSelector = "#__next > div.bywovg-1.sXmSU > div.main-content > div.sc-57oli2-0.dEqHl.cmc-body-wrapper > div > div:nth-child(1) > div.h7vnx2-1.bFzXgL > table > tbody > tr"

    $(elemSelector).each((parentInd, parentElem) => {
      // console.log(parentInd , parentElem);

      let keyIdx = 0;
      const objCoin = {};

      if (parentInd < 10) {
        $(parentElem)
          .children()
          .each((childInd, childElem) => {
            let tdVal = $(childElem).text();

            if (keyIdx == 1) {
              tdVal =
                $("p:first-child", $(childElem).html()).text() +
                " " +
                $("p:nth-child(2)", $(childElem).html()).text();
            }

            if (keyIdx == 5) {
              tdVal = $("span:nth-child(2)", $(childElem).html()).text();
            }

            if (keyIdx == 6) {
              tdVal = $("p:first-child", $(childElem).html()).text();
            }

            if (tdVal) {
              objCoin[keys[keyIdx]] = tdVal;
              keyIdx++;
            }
          });
        coinArr.push(objCoin);
      }
    });

    // console.log(coinArr);
    return coinArr;
  } catch (error) {
    console.log(error);
  }
}

const app = express();

app.get("/api/feed", async (req, res) => {
  try {
    const priceFeed = await getPriceFeed()

    return res.status(200).json({
      result: priceFeed,
    })
  } catch (error) {
    return res.status(500).json({
      error: error.toString(),
    })
  }
});

app.listen(3000, () => {
  console.log("Running on port 3000");
});
