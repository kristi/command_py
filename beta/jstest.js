function tscore(str, abbrev) {
    var score = 1.0;
    var m = {};
    m.str = str;
    filename = str.replace(/[^ ]*?\b(\w*)(?:\(\)|)(?: [({].*[)}]|)$/, '$1');
    m.abbrev = abbrev;
    m.max_score_per_char = (0.2 / (1 + filename.length) + 0.4 / (1 + str.length) + 1.2 / (1 + abbrev.length)) / 2;
    if ( abbrev.length == 0 ) {
        // nothing
    } else {
        score = recursive_match(m, 0, 0, 0, 0.0);
        //m.str = filename;
        //filescore = recursive_match(m, 0, 0, 0, 0.0);
        //score += filescore * 0.2;
    }
    return score;
}

function recursive_match(m, str_idx, abbrev_idx, last_idx, score) {
    var seen_score = 0;
    for (var i = abbrev_idx; i < m.abbrev.length; i++) {
        var c = m.abbrev[i];
        var found = 0;
        for (var j = str_idx; j < m.str.length; j++, str_idx++) {
            var d = m.str[j].toLowerCase();
            if ( c == d ) {
                found = 1;
                var score_for_char = m.max_score_per_char;
                var distance = j - last_idx;
                if ( distance > 1 ) {
                    var factor = 1.0;
                    var last = m.str[j - 1];
                    var curr = m.str[j];
                    if (last == "/") {
                        factor = 0.8;
                    } else if ( last == '.' ) {
                        factor = 1.0;
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


function submitQuery(e) {
    e.preventDefault();
    //var $form = $(this);
    //var $input = $form.find("input");
    var form = this;
    var input = form.getElementsByTagName("input")[0];
    var abbrev = input.value;
    var abbrevArray = abbrev.split('');
    for (var i = 0; i < abbrevArray.length; ++i) {
        abbrevArray[i] = regexEscape(abbrevArray[i]);
    }
    var abbrevRegexStr = "(^.*)(?:" + abbrevArray.join(")(.*?)(?:") + ")";
    var abbrevRegex = new RegExp(abbrevRegexStr, "i");
    //console.log(kscore("hello", abbrevRegex));
    //console.log(kscore("goodbye", abbrevRegex));

    var links = document.getElementById("links");
    var linksParent = links.parentNode;
    linksParent.removeChild(links);
    links.style.display = "none";
    //var itemsArr = Array.prototype.slice.call(links.children);
    var showArr = [];
    var hideArr = [];
    var unhideArr = [];
    var threshold = 0.1;
    var itemsArr = links.children;
    for (var i = 0; i < itemsArr.length; ++i) {
        var item = itemsArr[i];
        item.score = tscore(item.text, abbrev);
        if (item.score < threshold) {
            hideArr.push(item);
        } else {
            showArr.push(item);
        }
    }
    itemsArr = hiddenLinks.children;
    for (var i = 0; i < itemsArr.length; ++i) {
        var item = itemsArr[i];
        item.score = tscore(item.text, abbrev);
        if (item.score < threshold) {
            // already hidden, do nothing
        } else {
            unhideArr.push(item);
            showArr.push(item);
        }
    }
    showArr.sort(function(a, b) {
        //return (b.innerHTML < a.innerHTML);
        return (b.score - a.score) || ((b.text < a.text) ? 1 : -1);
    });
    for (var i = 0; i < unhideArr.length; ++i) {
        var item = unhideArr[i];
        hiddenLinks.removeChild(item);
    }
    for (var i = 0; i < hideArr.length; ++i) {
        var item = hideArr[i];
        links.removeChild(item);
        hiddenLinks.appendChild(item);
    }
    for (var i = 0; i < showArr.length; ++i) {
        var item = showArr[i];
        //item.innerHTML = item.text + " " + item.score;
        if (i < 10) {
            //console.log(item.text + item.score);
        }
        links.appendChild(item);
    }
    links.style.display = "";
    linksParent.appendChild(links);
    //linksParent.appendChild(hiddenLinks);
    console.log("done");

    /*
    $("#links a").each(function(index, el) {
        var $this = $(this);
        var str = $this.text();
        var score = tscore(str, abbrev);
        $this.score = score;
        if (score == 0) {
            $this.css('display', 'none');
        } else {
            $this.css('display', 'inline-block');
        }
    });
    */

    /*
    var $links = $("#links a");
    var display = [];
    $links.detach().sort(function(a, b) {
        return tscore($(b).text(), abbrev) - tscore($(a).text(), abbrev);
    }).appendTo("#links");
    */

    return false;
}
var hiddenLinks = null;
$(function() {
    console.log("hello");
    hiddenLinks = document.getElementById("hiddenLinks");
    hiddenLinks.parentNode.removeChild(hiddenLinks);

    //$("#search form").submit(submitQuery);
    document.getElementById("search").getElementsByTagName("form")[0].onkeyup = submitQuery;
});
