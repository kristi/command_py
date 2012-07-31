function tscore(str, abbrev) {
    var score = 1.0;
    var m = {};
    m.str = str;
    filename = str.replace(/[^ ]*?\b(\w*)(?:\(\)|)(?: [({].*[)}]|)$/, '$1');
    m.abbrev = abbrev;
    m.max_score_per_char = (0.3 / (2 + Math.max(filename.length,3)) + 0.4 / (1 + str.length) + 1.2 / (1 + abbrev.length)) / 2;
    if ( abbrev.length != 0 ) {
        score = recursive_match(m, 0, 0, 0, 0.0);
    }
    return score;
}

function recursive_match(m, str_idx, abbrev_idx, last_idx, score) {
    var seen_score = 0;
    for (var i = abbrev_idx; i < m.abbrev.length; i++) {
        var C = m.abbrev[i];
        var c = C.toLowerCase();
        var found = 0;
        for (var j = str_idx; j < m.str.length; j++, str_idx++) {
            var D = m.str[j];
            var d = D.toLowerCase();
            if ( c == d ) {
                found = 1;
                var score_for_char = m.max_score_per_char;
                if ( C != D ) {
                    score_for_char *= 0.9;
                }
                if ( j == 0 ) {
                    score_for_char *= 1.1;
                }
                var distance = j - last_idx;
                if ( c == "." ) {
                    distance = 0;
                }
                if ( distance > 1 ) {
                    var factor = 1.0;
                    var last = m.str[j - 1];
                    var curr = m.str[j];
                    if (last == "/") {
                        factor = 0.8;
                    } else if ( last == '.' ) {
                        factor = 1.1;
                    } else if ( last == "_" || last == " " || last == "-" || last == "(" || last == "{" || (last >= "0" && last <= "9") ) {
                        factor = 0.6;
                    } else {
                        if ( last >= "a" && last <= "z" && curr >= "A" && curr <= "Z" ) {
                            factor = 0.7;
                        } else {
                            factor = 0.3;
                        }
                        factor *= (1.0 / (1 + distance)) * 0.2;
                    }
                    score_for_char *= factor;
                }
                if (++j < m.str.length) {
                    var sub_score = recursive_match(m, j, i, last_idx, score);
                    if (sub_score > seen_score) {
                        seen_score = sub_score;
                    }
                }
                score += score_for_char;
                last_idx = str_idx++;
                break;
            }
        }
        if (found == 0) {
            return 0.0;
        }
    }
    return (score > seen_score) ? score : seen_score;
}

function regexEscape(str) {
    return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
}

function kscore(str, abbrevRegex) {
    var match = abbrevRegex.exec(str);
    return match;
}

function doQuery() {
    var input = document.getElementById("search");
    var abbrev = input.value.toLowerCase();
    var abbrevArray = abbrev.split('');

    if (!abbrev) {
        $("#links").html('');
        return;
    }

    for (var i = 0; i < abbrevArray.length; ++i) {
        abbrevArray[i] = regexEscape(abbrevArray[i]);
    }
    var abbrevRegexStr = "^(.*?)(" + abbrevArray.join(")(.*?)(") + ")(.*?)$";
    var abbrevRegex = new RegExp(abbrevRegexStr, "i");

    var showArr = [];
    var threshold = 0.1;
    for (var i=0; i < TEMPLATE_DATA.length; ++i) {
        var item = TEMPLATE_DATA[i];
        item.score = tscore(item.text, abbrev);
        if (item.score > threshold) {
            showArr.push(item);
        }
    }
    showArr.sort(function(a, b) {
        return (b.score - a.score) || ((b.text == a.text) ? 0 : (b.text < a.text) ? 1 : -1);
    });
    showArr = showArr.slice(0,100);
    for (var i = 0; i < showArr.length; ++i) {
        var item = showArr[i];
        var match = item.text.match(abbrevRegex);
        if (match.shift() != item.text) {
            console.log("error, regex failed :(");
        }
        for (var j = 1; j < match.length; j+=2) {
            match[j] = '<span class="highlight">' + match[j] + '</span>';
        }
        item.highlighted = match.join('');
    }
    console.log(showArr.length);
    var links = $("#links").jqotesub("#link-template", showArr);
    if (showArr.length >= 1) {
        links.children().first().jqoteapp("#ref-template", showArr[0]);
    }
    console.log("done");
    return false;
}

function initDataFilename() {
    for (var i=0; i < TEMPLATE_DATA.length; ++i) {
        var item = TEMPLATE_DATA[i];
        var str = item.text;
        item.filename = str.replace(/[^ ]*?\b(\w*)(?:\(\)|)(?: [({].*[)}]|)$/, '$1');
        item.title = item.filename;
    }
}

function hackFocus() {
    window.scrollTo(0, 0);
    //$("#search").focus();
}

$(function() {
    $("#search").focus();
    //document.getElementById("search").onkeyup = doQuery;
    $("#search").typeWatch({
        callback: doQuery,
        wait: 300,
        captureLength: 0
    });

    initDataFilename();
    doQuery();
});
