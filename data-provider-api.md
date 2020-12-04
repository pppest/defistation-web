![defistation](https://user-images.githubusercontent.com/34641838/100820703-2248d480-3492-11eb-8ac5-69149d08f4dd.png)
<h1 align="center">
    Defistation Data Provider REST API
</h1>

## Introduction

Data Provider API is a tool created for DeFi service providers to efficiently update TVL data to Defistation.

### URL Summary

In order to have your real-time TVL data displayed on Defistation, you must be issued an ID and API Key first. Please fill out the [Apply to be listed](https://www.defistation.io/projects) form and wait for a Defistation representative to reach back out after the initial screening process.
To expedite the listing process, please make sure to provide as much detail as possible and complete the required fields in the application form.
After review, Defistation will contact your team member through the contact info provided in the application. We will invite you to a slack group through the e-mail ID you provide in the application to proceed with the listing process.
Once you join the Slack group, we will issue and individually send your project’s own ID & API Key as Basic Auth type through direct message.
You must enter the header in the following form: ‘Authorization: Basic XXXX…’.
The base URL for our API: `https://api.defistation.io/dataProvider`. 


| Resource                                              | GET                                                 | POST                                  | PUT                               | DELETE                                      |
| ----------------------------------------------------- | --------------------------------- | --------------------------------- | --------------------------------- | --------------------------------- |
| /tvl                                         | N/A                                                | Input a new TVL | N/A                               | N/A                                         |
| /tvl?from={from-timestamp}&to={to-timestamp} | Returns a list of TVL defi service provider posted | N/A             | N/A                               | N/A                                         |

## Add your TVL

You are required to enter your “tvl” and locked “bnb” values (i.e. If you you do not have any BNB locked in your protocol, please enter 0). In “data”, please input all of contract information and contract addresses that are included towards your TVL count. Defistation will cross-check and verify the TVL value you input by calculating your TVL according to the contract list/address you provide with the data json value.
In “data”, please include all contract addresses that contain tokens, their respective token symbol, any contract addresses that contain your TVL count method, and any information/details/explanations that can help accurately calculate your TVL in json format.
There are no restrictions on the structure of “data” contents. The example below shows a json example using data.pairEntities key.

```
// Request (LP)
curl -X POST \
  https://api.defistation.io/dataProvider/tvl \
  -H 'Authorization: Basic Ym9veW91bjE6ZjI0OWJkMjAtMzM5My0xMWViLWJlZmQtMjM0Yjg4ZDIzXXXX' \
  -H 'Content-Type: application/json' \
  -d '{
    "tvl": 261098389,
    "bnb": 717048.6336811137,
    "data": {
        "pairEntities": [
            {
                "id": "0x00201101f5fd2cba32e6d3cf7d431e4475b16d3e",
                "token0": {
                    "symbol": "BUSD"
                },
                "token1": {
                    "symbol": "WBNB"
                }
            },
            {
                "id": "0x00af854f8e5522c1f0c22f7dd5f37cdb9ad1dd71",
                "token0": {
                    "symbol": "LINK"
                },
                "token1": {
                    "symbol": "WBNB"
                }
            }
        ]
    }
}'

// Request (Vault)
curl -X POST \
  https://api.defistation.io/dataProvider/tvl \
  -H 'Authorization: Basic Ym9veW91bjE6ZjI0OWJkMjAtMzM5My0xMWViLWJlZmQtMjM0Yjg4ZDIzXXXX' \
  -H 'Content-Type: application/json' \
  -d '{
    "tvl": 261098389,
    "bnb": 717048.6336811137,
    "data": {
        "pairs": [
            {
                "id": "0x00201101f5fd2cba32e6d3cf7d431e4475b16d3e",
                "token0": {
                    "symbol": "BUSD"
                }
            },
            {
                "id": "0x00af854f8e5522c1f0c22f7dd5f37cdb9ad1dd71",
                "token0": {
                    "symbol": "LINK"
                }
            }
        ]
    }
}'

// Request (Lending)
curl -X POST \
  https://api.defistation.io/dataProvider/tvl \
  -H 'Authorization: Basic Ym9veW91bjE6ZjI0OWJkMjAtMzM5My0xMWViLWJlZmQtMjM0Yjg4ZDIzXXXX' \
  -H 'Content-Type: application/json' \
  -d '{
    "tvl": 261098389,
    "bnb": 717048.6336811137,
    "data": {
        "NiceSwap": {
            "contractAddress": "0x00201101f5fd2cba32e6d3cf7d431e4475b16d3e",
            "tokens": ["BTCB", "USDT", "BUSD", "ETH", "DOT", "XRP", "LTC", "BCH", "EOS", "DAI", "ONT", "LINK", "YFII", "BAND", "ZEC", "XTZ", "FIL", "ATOM", "ADA", "FREE", "PROPEL", "FOR"]
        }
    }
}'
```

Defistation updates project TVLs every hour. You must post your TVL/locked BNB/json data 10 minutes before each hour (ex. 00:50, 01:50, 02:50, 03:50, ….., 23:50) - 24 times every day.
Projects that fail to post their hourly up-to-date information for a prolonged period of time will be delisted from Defistation. Please keep your data up-to-date at all times.
The data you post between 01:50~01:59 will be displayed on Defistation at 02:00.

```
// Response
Status 200 OK

{
    "status": "success",
    "data": {
        "pairEntities": [
            {
                "id": "0x00201101f5fd2cba32e6d3cf7d431e4475b16d3e",
                "token0": {
                    "symbol": "BUSD"
                },
                "token1": {
                    "symbol": "WBNB"
                }
            },
            {
                "id": "0x00af854f8e5522c1f0c22f7dd5f37cdb9ad1dd71",
                "token0": {
                    "symbol": "LINK"
                },
                "token1": {
                    "symbol": "WBNB"
                }
            }
        ]
    },
    "message": null
}
```

## Check your TVL

You can check the TVL data entered in Defistation with GET TVL API. If you do not enter from, to timestamp values, the latest 24-hour data is displayed by default.

```
// Request
curl -X GET \
  'https://api.defistation.io/dataProvider/tvl?from=1502766805&to=1606803480' \
  -H 'Authorization: Basic Ym9veW91bjE6ZjI0OWJkMjAtMzM5My0xMWViLWJlZmQtMjM0Yjg4ZDIzXXXX'
```

```
// Response
Status 200 OK

[
    {
        "name": "pancake",
        "bnb": 1429018.6336811137,
        "totalValue": 103653764,
        "data": "{\"pairEntities\":[{\"id\":\"0x00201101f5fd2cba32e6d3cf7d431e4475b16d3e\",\"token0\":{\"symbol\":\"BUSD\"},\"token1\":{\"symbol\":\"WBNB\"}},{\"id\":\"0x00af854f8e5522c1f0c22f7dd5f37cdb9ad1dd71\",\"token0\":{\"symbol\":\"LINK\"},\"token1\":{\"symbol\":\"WBNB\"}}]}",
        "timestamp": 1606803480
    }
]
```

## Defistation Services and Community

- [Defistation Website](https://www.defistation.io/)
- [Apply to be listed on Defistation](https://docs.google.com/forms/d/e/1FAIpQLSderGL_rQr3SV6DC0b-wKfAHm3CTUabGktIjxUOctv_gscxfQ/viewform)