const Eris = require("eris");
var steem = require("steem");
var mysql = require('mysql');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var con = mysql.createConnection({
 host: "sql142.main-hosting.eu.",
 user: "u785998855_root",
 password: "gsMLHvy4Q1IH",
 database: "u785998855_voter"
});
con.connect();
var bot = new Eris(process.env.BOT_TOKEN);
var regex = /(\$)+(upvote)+.+(https:\/\/)+.+(@)+.+(\/)/;
var regex1 = /(@)+.+(\/)/;
var wifkey = process.env.SECRET;
var votey = "gtbot";
var weight = 5000; // 10000 = 100%

bot.on("ready", () => {console.log('voter bot started!');}); //when it is ready
bot.on("messageCreate", (msg) => { // when a message is created
    if(msg.content.match(regex)){
        var permlink= msg.content.replace(msg.content.match(regex)[0],"");
        var au = msg.content.match(regex1)[0];
        var aut = au.replace("@","");
        var author = aut.replace("/","");
        var channel = msg.channel.id;
        var uid = msg.author.id;


        var x = '0';
        con.query('SELECT EXISTS(SELECT * FROM `voter` WHERE `userid` = "'+uid+'")', function (error, results, fields) {
            for(i in results){
                for(j in results[i]){
                    x = results[i][j];
                    if(x == '1'){
                        var last;
                        con.query('SELECT `lastvote` FROM `voter` WHERE `userid`="'+uid+'"', function (error, results, fields) {
                            for(i in results){
                                for(j in results[i]){
                                    last = results[i][j];


                                }
                            }
                            var time = Math.floor(new Date().getTime() / 1000);
                                if((time - last) > 86400){
                                    con.query('UPDATE `voter` SET `lastvote`="'+time+'" WHERE `userid`="'+uid+'"', function (error, results, fields) {
                                        steem.broadcast.vote(wifkey,votey,author,permlink,weight,function(downerr, result){
                                            if(downerr){
                                                setTimeout(function(){bot.createMessage(channel,'Already Upvoted!');},1000);
                                                con.query('UPDATE `voter` SET `lastvote`="'+last+'" WHERE `userid`="'+uid+'"', function (error, results, fields) {
                                                });
                                            }
                                            if(result) {
                                                setTimeout(function(){bot.createMessage(channel,'Done! Your Post has Been Upvoted By @gtbot');},1000);
                                            }
                                        });
                                    });
                                }else{
                                    var come = 300 - (time - last);
                                    setTimeout(function(){bot.createMessage(channel,'Sorry! Come back after '+come+' seconds.');},1000);
                                }
                        });


                    }else{
                        setTimeout(function(){bot.createMessage(channel,'You Are not Registered.');},1000);
                    }
                }
            }
        });


    }
    var regex2 = /(\$)+(register)+(\ )/;
    if(msg.content.match(regex2)){
        var sender = msg.content.replace(msg.content.match(regex2)[0],"");
        var memo = msg.author.id;
        var transaction = 'Receive  0.001 SBD from '+sender;
        var r = 0;
        var channel = msg.channel.id;


        con.query('SELECT EXISTS(SELECT * FROM `voter` WHERE `userid` = "'+msg.author.id+'" OR `user`="'+sender+'")', function (error, results, fields) {
            for(i in results){
                for(j in results[i]){
                    x = results[i][j];
                    if(x == 1){
                        setTimeout(function(){bot.createMessage(channel,'Already Registered!');},1000);
                    }else if(x == 0){
                        var xmlhttp = new XMLHttpRequest();
                        xmlhttp.onreadystatechange = function() {
                            if (this.readyState == 4 && this.status == 200) {
                                var response = JSON.parse(this.responseText);
                                for(i in response){
                                    if(response[i].transaction == transaction && response[i].memo == msg.author.id){
                                        con.query('INSERT INTO `voter`(`user`, `lastvote`, `userid`) VALUES ("'+sender+'","0","'+msg.author.id+'")', function (error, results, fields) {
                                            r = 1;
                                            setTimeout(function(){bot.createMessage(channel,'User '+sender+' Registered by <@'+msg.author.id+'>');},1000);
                                        });
                                        break;
                                    }
                                }
                                setTimeout(function(){if(r == 0){
                                    setTimeout(function(){bot.createMessage(channel,'<@'+msg.author.id+'>' + 'Please Send 0.001 SBD to '+votey+' with memo:`'+memo+'` and Try again.');},1000);
                                }},2000);
                            }
                        };
                        xmlhttp.open("GET", "https://steemfollower.com/voter-tx.php?user=" + votey , true);
                        xmlhttp.send(); 
                    }
                }
            }
        });
    }
});
bot.connect();
