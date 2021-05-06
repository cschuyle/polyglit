import React from 'react';

class HomePage extends React.Component {

    render() {
        return (
            <div id="main_content_wrap" className="outer">
                <section id="main_content" className="inner">
                    <ul>
                        <li><a href={"./the-little-prince"}>The Little Prince</a></li>
                        <li><a href={"./the-hobbit"}>The Hobbit</a></li>
                        <li><a href={"./alice-in-wonderland"}>The Adventures of Alice in Wonderland</a></li>
                    </ul>
                </section>
            </div>
        )
    }
}

export default HomePage;
