import React from "react";
import { DeckStats } from "../../Types";

type Props = {
    deck: DeckStats,
    onSelectDeck: (deckName: string) => void;
}
export default class DeckButton extends React.Component<Props> {
    constructor(props) {
        super(props);
    }
    onClick = () => {
        this.props.onSelectDeck(this.props.deck.name);
    }
    render() {
        return <div onClick={this.onClick} className="deckButton">{this.props.deck.name} - {this.props.deck.new_count} - {this.props.deck.learn_count} - {this.props.deck.review_count}</div>
    }
}