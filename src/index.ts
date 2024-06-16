import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import { beginCell, toNano } from "@ton/core";
import qs from "qs";
import { Address, TonClient } from "@ton/ton";


dotenv.config();
const bot = new Telegraf(process.env.TG_BOT_TOKEN!);

bot.start((ctx) =>
    ctx. reply ("Welcome to our counter app!", {
      reply_markup: {
        keyboard: [
          ["Increment by 5"],
          ["Deposit 1 TON"],
          ["Withdraw 0.7 TON"],
          ["Get data"],
        ],
      },
    })
  );

  bot.hears ("Increment by 5", (ctx) => {

    const msg_body = beginCell() 
    .storeUint(1, 32)
    .storeUint(5, 32)
    .endCell();

    let link = `https://app.tonkeeper.com/transfer/${process.env.SC_ADDRESS
    }?${qs.stringify(
        {
          text: "Increment 5",
          amount: toNano("0.05").toString(10),
          bin: msg_body.toBoc({ idx: false }).toString("base64"),
        }
    )}`;
    
    ctx.reply("To increment counter by 5, please sign a transaction:", {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: "Sign transaction",
                    url: link,
                }]
            ]
        }
    });
  });

    bot.hears("Deposit 1 TON", (ctx) => {
        const msg_body = beginCell().storeUint(2, 32).endCell();
            
        let link = `https://app.tonkeeper.com/transfer/${
            process.env.SC_ADDRESS
                }?${qs.stringify(
            {
                text: "Deposit 1 TON",
                amount: toNano("1").toString(10),
                bin: msg_body.toBoc({ idx: false}).toString("base64"),
            }
        )}`;
    
    ctx.reply("To deposit 1 TON please sign a transaction:", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Sign transaction",
                url: link,
              }
            ]
          ]
        }
      });
  });
  
  bot.hears("Withdraw 0.7 TON", (ctx) => {
    const msg_body = beginCell().storeUint(3, 32).endCell();
      
    let link = `https://app.tonkeeper.com/transfer/${
        process.env.SC_ADDRESS
            }?${qs.stringify(
            {
            text: "Withdraw 0,7 TON",
            amount: toNano("0.05").toString(10),
            bin: msg_body.toBoc({ idx: false}).toString("base64"),
            }
    )}`;
        
    ctx.reply("To withdraw 0.7 TON please sign a transaction:", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Sign transaction",
              url: link,
            }
          ]
        ]
      }
    });
});

bot.hears("Get data", async (ctx) => {
    const tonClient = new TonClient({
        endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
        });
    
    const address = Address.parse(process.env.SC_ADDRESS!);

    (async () => {
        const { stack } = await tonClient.runMethod(address, 'get_contract_storage_data');

        let number = stack.readNumber();
        let recent_sender = stack.readAddress();
        let owner_address = stack.readAddress();

        ctx.reply(number.toString());
        ctx.reply(recent_sender.toString());
        ctx.reply(owner_address.toString());
    })().catch(e => console.error(e));
});

  bot.launch();

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop ("SIGTERM"));