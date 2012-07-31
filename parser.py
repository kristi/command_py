# -*- coding: utf-8 -*-
"""
Parse Python doc to create index

Created on Sat Jul 28 00:57:10 2012

@author: kristi
"""

from bs4 import BeautifulSoup, SoupStrainer
import re


def write_html(soup, html_file):
    with open(html_file, 'w') as f:
        print >>f, soup
        
        
def write_links(links, link_file):
    with open(link_file, 'w') as f:
        print >>f, """<html>
        <head>
        <style>a {display: block;}</style>
        </head>
        <body>
        """
        for link in links:
            print >>f, link
        print >>f, """</body>
        </html>
        """


def parse_single(index_file, tag_id):
    soup = BeautifulSoup(open(index_file, "r"), "lxml")
    header = soup.find(id=tag_id)
    table = header.find_next_sibling("table")
    # add entry names to entries with multiple links
    links = convert_table(table)
    # DEBUG
    write_html(soup, "output.html")
    return links
    

def parse_all(index_file):
    
    soup = BeautifulSoup(open(index_file, "r"), "lxml")
    tables = soup.select("table.indextable")
    # Some entries have embedded <dl> for links with the same heading
    all_links = []
    for table in tables:
        links = convert_table(table)
        all_links += links
    # DEBUG
    write_html(soup, "output.html")
    write_links(all_links, "links.html")
    print "there are {num} links".format(num=len(all_links))
    return all_links

def convert_table(table):
    links = table.find_all("a")
    for link in links:
        # fix [1] links
        if re.search(r'\[\d+\]$',link.string):
            link.string = link.find_previous_sibling("a").string
        
    dldl = table.select("dl dl")
    for d in dldl:
        entry = d.parent.find_previous_sibling("dt").text
        entry = re.sub(r' \(.+\)$','', entry)
        for a in d.select("a"):
            desc = a.string
            if desc.startswith("(") and desc.endswith(")"):
                desc = desc[1:-1]
            a.string = entry + " {" + desc + "}"
    
    #return [convert_link(link) for link in links]
    for link in links:
        convert_link(link)
    return links

    
def convert_link(link):
    text = link.string
    
    href, hashtag = link["href"].split("#")
    
    if re.search(r'^[\w.]+\(\)',text):
        hashtag += "()"
        
    if "-" in hashtag:
        hashid,hashval = hashtag.split("-", 1)
        if hashid == "index":
            return text + "(mentioned)"
        elif hashid == "module":
            return text
        elif hashid == "term":
            return text
        elif hashid == "2to3fixer":
            return text
        elif hashid == "envvar":
            return text
        elif hashid == "opcode":
            return text
        elif hashid == "cmdoption":
            return text
    else:
        link['title'] = text
        link.string = hashtag
    return hashtag
    
def _find_hashids(index_file):    
    """
    Some hashtags don't have a package name; they look like:
    
        index-34
        2to3fixer-zip
        term-virtual-machine
        module-warnings
        opcode-BINARY_FLOOR_DIVIDE
        envvar-PYTHONY2K
        cmdoption-unittest-discover-v
    """ 
    hashtags = parse_all(index_file)
    hashid = [h.split("-")[0] for h in hashtags if "-" in h]
    s = set(hashid)
    return s

if __name__ == "__main__":
    index_file = "Python-2.7.3/Doc/build/html/genindex-all.html"
    z_file = "Python-2.7.3/Doc/build/html/genindex-Z.html"
    
html = """
<div class="body">
<h2 id="Symbols">Symbols</h2>
<table class="indextable genindextable">
<tbody>
<tr>
<td></td>
<td>
    <dl>
    <dt>&lt;=</dt>
    <dd><dl>
      <dt><a href="library/stdtypes.html#index-9">operator</a></dt>
    </dl></dd>
    </dl>
</td>
</tr>
</tbody>
</table>
</div>
    """
soup = BeautifulSoup(html)

X = parse_all(index_file)
#for x in X:
#    print x
