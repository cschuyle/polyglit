import React from 'react';
import ReactMarkdown from 'react-markdown'

class HomePage extends React.Component {

    body = `
# TL; DR

- [The Little Prince](./the-little-prince)
- [The Hobbit](./the-hobbit)
- [The Adventures of Alice in Wonderland](./alice-in-wonderland)

# What's a Polyglit??

That's me being clever by abbreviating the phrase "Polyglot Literature".

Actually, it's not an abbreviation.  It's not even a contraction.  
It's a [portmanteau](https://en.wikipedia.org/wiki/Portmanteau)

---

This site contains a summary of various works of literature that I've acquired over the years, in languages other 
than my native one (which is English).


## The Little Prince
 
[The Little Prince](the-little-prince) is one of the most widely translated books around, so it only makes sense to 
collect those.
  
Granted, this is not a particularly original endeavor - lots of folks collect this one.  A few that I've found:
* [petit-prince-collection](http://www.petit-prince-collection.com/lang/traducteurs.php?lang=en)
* [petit-prince.at](http://www.petit-prince.at/collection.htm)
* [genius.com/Antoine-de-saint-exupery-collection-of-the-little-prince-editions-annotated](https://genius.com/Antoine-de-saint-exupery-collection-of-the-little-prince-editions-annotated) - Fairly complete looking list of editions, with metadata!
* [malyksiaze.net](https://malyksiaze.net/en) - This one has a "let's make a deal" page

## A couple other likely targets

If I'm in a store trying to find a book in language _X_, and can't find The Little Prince, 
I'll generally go for [The Hobbit](the-hobbit), or [Alice in Wonderland](alice-in-wonderland) (yes, I know that the actual title is _Alice's Adventures in Wonderland_).

## Nope, try again

Failing the above, I cast about for whatever I can find: Translations into local languages or local literature.
I like to find children's books because it's easier to learn from them as a beginner.
And of course, language learning materials.
Here are the [foreign-language books](foreign-language-books) I've acquired.

## Non-dead-tree options

I also "have" some electronic-only material:

* [Alice in Wonderland in Lojban](http://alis.lojban.org/) (or, [archived locally](alice-in-wonderland-in-lojban))
* [The Little Prince in Esperanto](https://drive.google.com/file/d/0B9qESZHpLQVvZGRQRDl3VzIzakk/view)  (or, [archived locally](the-little-prince-in-esperanto/La%20eta%20princo.pdf))
* [The Little Prince in Tamashek](the-little-prince-in-amazigh/the%20little%20prince%20in%20amazigh.pdf)
* Various [translations of The Little Prince](http://www.laetaprinco.org/), including but not limited to:
   * [Mandarin](http://www.laetaprinco.org/index.php?page=0&lang=cn)
   * [Arabic](http://www.laetaprinco.org/index.php?page=0&lang=ar) (although on my computer there is a small number of missing characters in my font set)
   
## Translations are boring

The astute among you have noticed that all the above are translations.  
So, here are some books I've acquired over the years in their original language:
* Das Kapital (German)
* Le Petit Prince (French)
* Mосква 2042 (Russian)
* Embers (Hungarian)
* 2666 (Spanish)
* Kéraban le tétu (French)
* Mais où sont passées les Indo Européens? (French)
* Python для дітей (Ukrainian)
* De ontdekking van de hemel (Dutch)
* Распу́тин (Russian)
* À la recherche du temps perdu (French)
* La Possibilité d'une île (French)
* 三体 (Mandarin)
* Ciacole al pedocin (Triestese)
* Évkönyv (Hungarian)
* Innansveitarkronika (Icelandic)
* Βίος και Πολιτεία του Αλέξη Ζορμπά (Greek)
* Örtlich Betäubt (German)
* Marvirinstrato (Esperanto) 
* Le capital au XXI<sup>e</sup> siècle`

    render() {
        return (
            <div id="main_content_wrap" className="outer">
                <section id="main_content" className="inner">
                    <ReactMarkdown children={this.body}></ReactMarkdown>
                </section>
            </div>
        )
    }
}

export default HomePage;
