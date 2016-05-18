package com.mygdx.game.characters.State;

import com.mygdx.game.characters.GameCharacter;

public class Stand extends State {

    public Stand(GameCharacter character) {
        super(character);
    }

    public void stand() {}
    public void runLeft() {character.state = new RunningLeft(character);}
    public void runRight() {character.state =  new RunningRight(character);}
    public void walkLeft() {}
    public void walkRight() {}

    @Override
    public void climbUp() {character.state = new ClimbingUp(character);}

    @Override
    public void climbDown() {character.state = new ClimbingDown(character);}
}
