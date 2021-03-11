import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import useStores from "../../useStores";

import {
  numberWithCommas,
  getCurrencyUnit,
  getCurrencyUnitFullName,
  getCurrencyDigit,
  getOfficialDefiName,
} from "../../util/Util";

import MiniCards from "../miniCards/MiniCards";
import Chart from "react-google-charts";

const TotalValue = observer((props) => {
  const { global } = useStores();

  const [responseError, setResponseError] = useState();
  const [response, setResponse] = useState({});

  // all, 1year, 90days
  const [chartPeriod, setChartPeriod] = useState("30"); // 7, 30, 90, 365

  const [chartData, setChartData] = useState(["x", "TVL(USD)"]);
  const [totalValueLockedUsd, setTotalValueLockedUsd] = useState(0);
  const [minTvl, setMinTvl] = useState(0);
  const [linkTag, setLinkTag] = useState("");

  const [currencyFullName, setCurrencyFullName] = useState("");

  const [viewWidth, setViewWidth] = useState("750px");

  // const defistationApiUrl = "https://api.defistation.io";

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  function getMonthAndDay(date) {
    let monthName = monthNames[date.getMonth()];
    let day = date.getDate();
    return monthName + " " + day;
  }

  // const [urlFlag1, setUrlFlag1] = useState(false);
  const [urlFlagDetail, setUrlFlagDetail] = useState("");

  async function getChart(defiName) {
    // if (defiName == "DeFi") {
    //     if (urlFlag1) return;
    // }
    // setUrlFlag1(true);

    // console.log("getChart 함수 시작");

    let urlStr = "";
    if (defiName == "DeFi") {
      urlStr = "all";
    } else {
      urlStr = defiName;
    }

    // console.log("urlStr: ", urlStr);
    if (urlStr == "") {
      global.changeTotalValueLockedUsd("$ 0");
      global.changeTvl1DayPercent(0);
      return;
    }

    let chartFullUrl;
    if (chartPeriod == 7) {
      // default
      chartFullUrl = "/chart/" + urlStr + "?days=" + chartPeriod;
    } else {
      chartFullUrl = "/chart/" + urlStr + "?days=" + chartPeriod;
    }

    // detail
    if (urlFlagDetail == chartFullUrl) return;
    setUrlFlagDetail(chartFullUrl);

    const res = await fetch(global.defistationApiUrl + chartFullUrl, {
      method: "GET",
      headers: {
        Authorization: global.auth,
      },
    });
    res
      .json()
      .then((res) => {
        // console.log("res: ", res);

        // data={[
        //     ['x', 'TVL(USD)'],
        //     ["Jan", 1400],
        //     ["Feb", 1300],
        //     ["Mar", 3510],
        //     ["Apr", 1070],
        //     ["May", 2480],
        //     ["Jun", 5140],
        //     ["Jul", 5520],
        //     ["Aug", 8830],
        // ]}
        // let tempChartData = [['x', 'TVL(USD)']];

        let tempChartData = [];

        if (res.result == null) {
          setMinTvl(0);
          global.changeTotalValueLockedUsd("$ 0");
          return;
        }

        // res.result 를 배열로 바꾸기
        let resultObj = res.result;
        var resultArr = Object.keys(resultObj).map((key) => [
          Number(key),
          resultObj[key],
        ]);

        let initTimestamp = 0;
        let tempMinTvl = 0;

        // K, M, B 기준은 최초 0번째 데이터(단, 0번째가 0이 아닐때)
        // let digit = getCurrencyDigit(resultArr[0][1]);
        // let currencyUnit = getCurrencyUnit(resultArr[0][1]);
        // let tempCurrencyFullName = getCurrencyUnitFullName(resultArr[0][1]);
        let digit;
        let currencyUnit;
        let tempCurrencyFullName;
        // if (resultArr[0][1] > 0) {
        //     digit = getCurrencyDigit(resultArr[0][1]);
        //     currencyUnit = getCurrencyUnit(resultArr[0][1]);
        //     tempCurrencyFullName = getCurrencyUnitFullName(resultArr[0][1]);
        // } else {
        //     digit = getCurrencyDigit(resultArr[resultArr.length - 1][1]);
        //     currencyUnit = getCurrencyUnit(resultArr[resultArr.length - 1][1]);
        //     tempCurrencyFullName = getCurrencyUnitFullName(resultArr[resultArr.length - 1][1]);
        // }
        // Billion!
        digit = getCurrencyDigit(resultArr[resultArr.length - 1][1]);
        currencyUnit = getCurrencyUnit(resultArr[resultArr.length - 1][1]);
        tempCurrencyFullName = getCurrencyUnitFullName(
          resultArr[resultArr.length - 1][1]
        );
        setCurrencyFullName(tempCurrencyFullName);

        for (var i = 0; i < resultArr.length; i++) {
          if (i == 0) {
            initTimestamp = resultArr[i][0];
          }

          // console.log("resultArr[i][0]: ", resultArr[i][0]);
          // console.log("resultArr[i][1]: ", resultArr[i][1]);

          // let digit = getCurrencyDigit(resultArr[i][1]);
          // console.log("digit: ", digit);

          let currencyNum = (resultArr[i][1] / digit).toFixed(3) * 1;

          if (i == 0) {
            tempMinTvl = currencyNum;
          } else {
            // 가장 작은 값 찾기(vAxis 최솟값)
            if (tempMinTvl > currencyNum) {
              tempMinTvl = currencyNum;
            }
          }

          // 이전 연속 2개의 값이 0이 아니라면 직전 값으로 보정한다. (미싱 데이터 보정)
          if (currencyNum == 0) {
            // 이전 2개의 값이 0인가?
            if (i > 2) {
              let prevCurrentNum1 =
                (resultArr[i - 1][1] / digit).toFixed(3) * 1;
              let prevCurrentNum2 =
                (resultArr[i - 2][1] / digit).toFixed(3) * 1;

              // if (prevCurrentNum1 > 0 && prevCurrentNum2 > 0) {
              //     currencyNum = prevCurrentNum1;
              // }
              if (prevCurrentNum1 > 0) {
                currencyNum = prevCurrentNum1;
              } else if (prevCurrentNum2 > 0) {
                currencyNum = prevCurrentNum2;
              }
            }
          }

          tempChartData.push([
            getMonthAndDay(new Date(resultArr[i][0] * 1000)),
            currencyNum,
          ]);

          if (i == resultArr.length - 1) {
            setTotalValueLockedUsd(currencyNum + " " + currencyUnit);
            // global.changeTotalValueLockedUsd("$ " + currencyNum + " " + currencyUnit);
            global.changeTotalValueLockedUsd(
              "$ " + numberWithCommas(resultArr[i][1])
            );
          }
        }

        // 차트 데이터가 7개가 안채워졌으면 앞에 채워넣기
        if (chartPeriod - resultArr.length > 0) {
          let createEmptyDataLength = chartPeriod - resultArr.length;
          // console.log("createEmptyDataLength: ", createEmptyDataLength);
          for (var i = 0; i < createEmptyDataLength; i++) {
            let calTimestamp = initTimestamp - 86400 * (i + 1);
            // tempChartData 의 제일 앞에 넣어야함
            tempChartData.unshift([
              getMonthAndDay(new Date(calTimestamp * 1000)),
              0,
            ]);
          }
        }

        // 차트: 7d
        if (tempChartData.length > chartPeriod) {
          let remainDataLength = tempChartData.length - chartPeriod;
          for (var i = 0; i < remainDataLength; i++) {
            tempChartData.shift(); // 맨 앞 원소 제거
          }
        }

        tempMinTvl = Math.floor(tempMinTvl * 0.9);
        // 차트 최솟값 설정(차트 모양 예쁘게 하기 위함)
        setMinTvl(tempMinTvl);
        // 차트 데이터 적용
        tempChartData.unshift(["x", "TVL(USD)"]);
        setChartData(tempChartData);

        // TVL 1 DAY(%)
        // resultArr 가 2개 이상 요소를 가지고 있어야함. 그리고 가장 마지막과 그 이전의 % 차이를 계산하면 됨
        if (resultArr.length >= 2) {
          let latestTvl = resultArr[resultArr.length - 1][1];
          let pastTvl = resultArr[resultArr.length - 2][1];

          // console.log("latestTvl: ", latestTvl);
          // console.log("pastTvl: ", pastTvl);
          // console.log("((1 - pastTvl / latestTvl) * 100).toFixed(2) * 1: ", ((1 - pastTvl / latestTvl) * 100).toFixed(2) * 1);

          let resultTvl1DayPercent =
            ((1 - pastTvl / latestTvl) * 100).toFixed(2) * 1;
          if (!isNaN(resultTvl1DayPercent)) {
            // 숫자인 경우에만
            global.changeTvl1DayPercent(resultTvl1DayPercent);
          } else {
            global.changeTvl1DayPercent(0);
          }

          // 숫자가 이상한 경우 (2020.12.7 09:00 PM)
          if (resultTvl1DayPercent > 1000) {
            global.changeTvl1DayPercent(0);
          }
        } else {
          // 계산할 값이 없으면 0
          global.changeTvl1DayPercent(0);
        }

        // 홈 하단 1 Day Change 계산
        console.log("res.details: ", res.details); // undefined
        let resultDetailsObj = res.details;
        global.changeChartDataDetails(resultDetailsObj);

        // // tvl1DayChangeArr["pancake"] 이렇게 사용하도록 형식 변경
        // let resultDetailsObj = res.details;
        // var resultDetailsArr = Object.keys(resultDetailsObj).map((key) => [key, resultDetailsObj[key]]);

        // console.log("resultDetailsArr: ", resultDetailsArr);

        // let tvl1DayChangesArr = new Object;
        // for (var i = 0; i < resultDetailsArr.length; i++) {
        //     tvl1DayChangesArr[resultDetailsArr[i][0]] = resultDetailsArr[i][1];
        // }

        // console.log("tvl1DayChangesArr: ", tvl1DayChangesArr);
      })
      .catch((err) => setResponseError(err));
  }

  function openWindow(path) {
    window.open(path);
  }

  function selectOfficialLink(defiName) {}

  // ------------ 모바일 구글 차트를 위한 resize 체크 START ------------

  useEffect(() => {
    getChart(props.defiName);

    {
      /* PC: 750px, Mobile: 300px */
    }
    if (window.innerWidth <= 1034) {
      setViewWidth("300px");
    }

    console.count("TotalValue render");
    console.log("props.defiName: ", props.defiName);

    selectOfficialLink(props.defiName);

    return () => {
      // console.log('cleanup');
      // clearTimeout(timer);
    };
  }, [props.defiName, global.tvl1DayPercent, linkTag, viewWidth, chartPeriod]);

  return (
    <div className="totalValue">
      {/* subpage 타이틀 */}
      <div></div>

      <ul className="totalValueUl">
        <li>
          {/* style={props.defiName != "DeFi" ? {backgroundColor: "#171a20"} : {backgroundColor: "#262932"}} */}
          <div
            className="tvlChartCard"
            style={
              props.defiName != "DeFi"
                ? { backgroundColor: "#262932" }
                : { backgroundColor: "#262932" }
            }
          >
            <ul className="tvlChartCardUl">
              <li>
                <span className="tvlChartCardTitle">
                  Total Value Locked in {getOfficialDefiName(props.defiName)}
                </span>
                <p className="tvlValueUsd">$ {totalValueLockedUsd}</p>
                <p className="tvlChartUnitY">({currencyFullName} USD)</p>

                {/* Main Chart */}
                <div
                  id="tvlGoogleChart"
                  style={
                    props.defiName != "DeFi" ? { display: "none" } : undefined
                  }
                >
                  {/* PC: 750px, Mobile: 300px */}
                  <Chart
                    id="tvlGoogleChart"
                    width={viewWidth}
                    height={"220px"}
                    chartType="LineChart"
                    loader={
                      <div
                        style={{
                          width: viewWidth,
                          height: "220px",
                          "text-align": "center",
                          "margin-top": "70px",
                        }}
                      ></div>
                    }
                    data={chartData}
                    options={{
                      backgroundColor: "#262932",
                      legend: "none",
                      animation: { duration: 500, easing: "out" },
                      hAxis: {
                        textStyle: {
                          color: "#757f8e",
                          fontSize: 11,
                        },
                        slantedText: true,
                        baselineColor: "#fff",
                        gridlineColor: "#3D424D",
                      },
                      vAxis: {
                        minValue: minTvl,
                        textStyle: {
                          color: "#757f8e",
                        },
                        baselineColor: "#fff",
                        gridlineColor: "#3D424D",
                      },
                      series: {
                        // 0: { curveType: 'function' },
                      },
                      colors: ["#f0b923"],
                      chartArea: { width: "86%", height: "70%" },
                    }}
                    rootProps={{ "data-testid": "2" }}
                  />
                </div>
                {/* Subpage Chart */}
                <div
                  id="tvlGoogleChart"
                  style={
                    props.defiName != "DeFi" ? undefined : { display: "none" }
                  }
                >
                  <Chart
                    id="tvlGoogleChart"
                    width={viewWidth}
                    height={"220px"}
                    chartType="LineChart"
                    loader={
                      <div
                        style={{
                          width: viewWidth,
                          height: "220px",
                          "text-align": "center",
                          "margin-top": "70px",
                        }}
                      ></div>
                    }
                    data={chartData}
                    // options={{
                    //     backgroundColor: "#171a20",
                    //     legend: "none",
                    //     hAxis: {
                    //         textStyle: {
                    //             color: '#bbbebf',
                    //         },
                    //         baselineColor: '#fff',
                    //         gridlineColor: '#3D424D',
                    //     },
                    //     vAxis: {
                    //         minValue: minTvl,
                    //         textStyle: {
                    //             color: '#bbbebf',
                    //         },
                    //         baselineColor: '#fff',
                    //         gridlineColor: '#3D424D',
                    //     },
                    //     series: {
                    //     // 0: { curveType: 'function' },
                    //     },
                    //     colors: ['#f0b923'],
                    //     chartArea: { width: '86%', height: '75%' },
                    // }}
                    options={{
                      backgroundColor: "#262932",
                      legend: "none",
                      hAxis: {
                        textStyle: {
                          color: "#757f8e",
                          fontSize: 11,
                        },
                        // slantedText: true,
                        baselineColor: "#fff",
                        gridlineColor: "#3D424D",
                      },
                      vAxis: {
                        minValue: minTvl,
                        textStyle: {
                          color: "#757f8e",
                        },
                        baselineColor: "#fff",
                        gridlineColor: "#3D424D",
                      },
                      series: {
                        // 0: { curveType: 'function' },
                      },
                      colors: ["#f0b923"],
                      chartArea: { width: "86%", height: "70%" },
                    }}
                    rootProps={{ "data-testid": "2" }}
                  />
                </div>
              </li>
              <li>
                {/* <button className="periodBtnSelected" onClick={() => setChartPeriod("7")}>7d</button>
                                <button className="periodBtn" onClick={() => setChartPeriod("30")}>30d</button> */}

                <button
                  style={chartPeriod == 7 ? undefined : { display: "none" }}
                  className="periodBtnSelected"
                >
                  7d
                </button>
                <button
                  style={chartPeriod == 7 ? { display: "none" } : undefined}
                  className="periodBtn"
                  onClick={() => setChartPeriod("7")}
                >
                  7d
                </button>

                <button
                  style={chartPeriod == 30 ? undefined : { display: "none" }}
                  className="periodBtnSelected"
                >
                  30d
                </button>
                <button
                  style={chartPeriod == 30 ? { display: "none" } : undefined}
                  className="periodBtn"
                  onClick={() => setChartPeriod("30")}
                >
                  30d
                </button>
              </li>
            </ul>
          </div>
        </li>
        <li>
          {/* Home */}
          <MiniCards defiName="DeFi" />

          <div
            className="tvlLink"
            style={props.defiName == "DeFi" ? { display: "none" } : undefined}
          ></div>
        </li>
      </ul>
    </div>
  );
});

export default TotalValue;
