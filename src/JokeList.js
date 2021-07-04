import React, { Component } from "react";
import "./JokeList.css";
import axios from "axios";
import emoji from "./emoji-face.png";
import Joke from "./Joke";

const BASE_URL = "https://icanhazdadjoke.com/";

class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10,
  };
  constructor(props) {
    super(props);
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      loading:false
    };
    this.seenJokes = new Set(this.state.jokes.map(j=>j.joke));
    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    if (this.state.jokes.length === 0) this.getJokes();
  }
  async getJokes() {
    try{

    
    let jokes = [];
    while (jokes.length < this.props.numJokesToGet) {
      //get 10 uniqque jokes
      let res = await axios.get(BASE_URL, {
        headers: {
          Accept: "application/json",
        },
      });
      if(!this.seenJokes.has(res.data.joke))
      jokes.push({ joke: res.data.joke, votes: 0, id: res.data.id });

    }

    this.setState(st=>({
        jokes:[...st.jokes,...jokes],
        loading:false
    }),
    ()=>window.localStorage.setItem("jokes",JSON.stringify(this.state.jokes))
    );
    //this would just set the new ones
    // window.localStorage.setItem("jokes", JSON.stringify(jokes));
  }
  catch(err)
  {
    alert(err);
    this.setState({loading:false});
  }
  }
  handleVote(id, delta) {
    //delta can be positive or negative
    //also update vote in localStorage
    this.setState((prevState) => {
      return {
        jokes: prevState.jokes.map((joke) => {
          if (id === joke.id) return { ...joke, votes: joke.votes + delta };
          return joke;
        }),
      };
    },
    ()=>window.localStorage.setItem("jokes",JSON.stringify(this.state.jokes))
    );
  }
  handleClick()
  {
      this.setState({loading:true},this.getJokes);
  }
  render() {
      if(this.state.loading)
      {
          return(
              <div className="JokeList-spinner">
                  <i className="far fa-8x fa-laugh fa-spin"/>
                  <h1 className="JokeList-title">Loading...</h1>
              </div>
          )
      }
      let jokes = this.state.jokes.sort((a,b)=>b.votes-a.votes)
    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Dad</span> Jokes
          </h1>
          <img src={emoji} alt="emoji-face" />
          <button onClick={this.handleClick} className="JokeList-getmore">Fetch Jokes</button>
        </div>
        <div className="JokeList-jokes">
          {jokes.map((j) => {
            return (
              <Joke
                key={j.id}
                joke={j.joke}
                votes={j.votes}
                upvote={() => this.handleVote(j.id, 1)}
                downvote={() => this.handleVote(j.id, -1)}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

export default JokeList;
