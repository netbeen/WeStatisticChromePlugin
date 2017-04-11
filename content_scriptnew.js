function StatisticObject() {
    this.date = [0,0,0,0,0,
                 0,0,0,0,0,
                 0,0,0,0,0,
                 0,0,0,0,0,
                 0,0,0,0,0,
                 0,0,0,0,0,
                 0,0] ;     // 每日回款额
    this.income = 0;                                               //每日理论收益
    this.shareSum = 0;                            //总份数
    this.valueSum = 0;                                //总价值
    this.interestDistribution = {};                  //每种利率的份数
    this.availableSum = 0;  // 可转让金额
}

$(function() {
    var startButton = $("<div style=\"right:0px; height: 25px; width: 216px;position:absolute;background-color: #E1DCEE;z-index: 10000001\">" +
        "<div style='cursor: pointer;float:left;width:75%' id='calculateButton'>计算收益</div><div style='cursor: pointer;float:right;width:25%' id='displayButton'>显示</div>" + 
        "<div id='statisticState'style='display: none;background-color: #E1DCEE;'></div>" +
        "<div id='statisticDiv'style='display: none;background-color: #E1DCEE;' ></div></div>");

    $("body").prepend(startButton);
    $("#calculateButton").click(function(){
        var staObj = new StatisticObject();
	$("#statisticState").show();
        getPageContent(1,staObj);
    });
    $("#displayButton").click(function(){
        $("#statisticDiv").slideToggle("slow");
    });
    $("#statisticDiv").html(localStorage.getItem("calculateResult"));
});

/*statisticObject 属性
    date[0,1,2,3....] ,     每日回款额
    shareSum               总份数
    valueSum               总价值
    interestDistribution{}     每种利率的份数
*/
//计算已持有的债权
function getPageContent(pageIndex,statisticObject){
$("#statisticState").html("正在获取第"+ pageIndex +"页......请等待.....");
    $.ajax({
        type : "GET",
        url : "https://www.we.com/account/invest!loanPreJson.action?loanType=REPAYING_LOAN&pageIndex=" + pageIndex + "&_=" + new Date().getTime(),
        dataType:"json",contentType:"application/json;charset=utf-8",
        success : function(data) {
            if (data["status"] == 0) {
                var loanList = data.data.loanList;
                $.each(loanList,function(i,val){
                    statisticObject.income += val.currentValuePerShare * val.share * val.interest / 36500;
                    statisticObject.valueSum += val.currentValuePerShare * val.share * val.interest;
                    statisticObject.shareSum += val.currentValuePerShare * val.share ;
                    if(val.mouths-val.leftPhases>=3 ){statisticObject.availableSum+= val.currentValuePerShare * val.share};
                    if(!statisticObject.interestDistribution[val.interest.toFixed(2).toString()]){statisticObject.interestDistribution[val.interest.toFixed(2).toString()]=0};
                    statisticObject.interestDistribution[val.interest.toFixed(2).toString()] += val.share;
                    var dsy = val.passTime.substr(8,2);
                    statisticObject.date[parseInt(dsy)] += val.monthlyRepay;
                });
                if (data.data.totalPage != pageIndex) {
                    setTimeout(getPageContent(pageIndex+1,statisticObject), 8000);
                }else{
                    var str = "<p>加权利率:" + (statisticObject.valueSum/statisticObject.shareSum).toFixed(3) + "%</p>"+
                    	"<p>每日净利息收益:"+ statisticObject.income.toFixed(2) +"元</p>"+
                    	"<p>可转让金额: "+ statisticObject.availableSum.toFixed(2) +"元</p>"+
                    	"<hr/><table style='width:100%;border: 1px;'><tr>";
                    for(i = 1;i<statisticObject.date.length;i++){
                        var bg = "<td>";
                        if(i == new Date().getDate()){bg = "<td style='background-color:#fff;'>";}
                        str += bg + statisticObject.date[i].toFixed(2) + "</td>";
                        if(i%3 == 0){str += "</tr><tr>";}
                    }
                    str += "</tr></table><hr/>";
                    var intD = statisticObject.interestDistribution;
                    var keys = Object.keys(intD);
                    keys.sort();
                    var len = keys.length;
                    for (i = 0; i < len; i++)
                    {
                        var s = keys[i];
                        str +=  s + ": " + intD[s] + "<br/>";
                    }
                    $("#statisticDiv").html(str);
                    localStorage.setItem("calculateResult", str);
		    $("#statisticState").hide("");
                }
            }
        }
    });
}


//[{"allProtected":false,"alreadyRecoveryPrincipal":0.0,"amountPershare":50.0,"borrowAmount":20000.0,
//	"currentValuePerShare":0.0,"displayLoanType":"XYRZ","earnInterest":0.94,"fee":null,"interest":13.0,
//	"isTransferable":"1","lastRepayDate":null,"leftPhases":19,"lendAmount":85.04,"loanId":327333,
//	"loanLenderId":8108223,"loanType":"DEBX",
//	"loanVo":{"address":null,"allProtected":null,
//		"allowAccess":false,"amount":85.04,"amountPerShare":0.0,"avatar":null,"beginBidTime":null,
//		"borrowType":null,"borrowerId":null,"borrowerLevel":null,"closeTime":null,"collectCorpus":null,
//		"collectInterest":null,"creditLevel":null,"currentIsRepaid":false,"description":null,
//		"displayLoanType":null,"earnMoney":null,"finishDate":null,"finishType":null,"finishedRatio":0.0,
//		"forbidComment":false,"interest":13.0,"interestAndCorpus":null,"interestPerShare":0.0,
//		"jobType":null,"leftMonths":null,"leftPhaseCount":"19","lenderId":"8108223","loanAmount":null,
//		"loanId":327333,"loanType":null,"loanVo":null,"minInvestShares":1,"monthlyMinInterest":null,
//		"months":0,"nextRepayDate":null,"nickName":null,"noCollectCorpus":null,"noCollectInterest":null,
//		"notPayInterest":null,"notPayInterestAndMgmtFee":null,"notPayPrincipal":null,"nowShare":"2",
//		"oldLoan":false,"openTime":null,"overDueDate":null,"overDued":false,"overdueAmount":null,
//		"passTime":null,"picture":null,"pricePerShare":null,"principal":0.0,"principalPerShareNow":null,
//		"productId":0,"productName":null,"readyTime":null,"recoveryAmount":null,"recoveryInterest":null,
//		"remainderTime":null,"repaidByGuarantor":false,"repaidByGuarantorTime":null,"repayDate":null,
//		"repayInterestAndCorpus":null,"repayMgmtFee":null,"repayMoney":null,"repayType":null,
//		"resultPice":null,"startTime":null,"status":null,"surplusAmount":null,"title":null,
//		"transferShare":null,"utmSource":null,"verifyState":null},
//	"minInvestShares":1,
//	"monthlyRepay":4.76,"mouths":24,"nextRepayDate":"2015-05-12T13:48:56","oldLoan":false,
//	"overdueAmount":0.0,"passTime":"2014-11-12T13:48:56","productType":"XYRZ",
//	"recoveryAmount":90.26,"recoveryAmountPerShare":45.13,"recoveryInterest":9.06,
//	"recoveryPrincipal":81.2,"share":2,"status":"OVER_DUE","transferShare":0},