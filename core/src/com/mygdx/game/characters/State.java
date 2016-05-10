package com.mygdx.game.characters;

import com.badlogic.gdx.math.Vector3;

/**
 * Created by Alan on 4/2/2016.
 */
public abstract class State {

    public GameCharacter character;

    public State(GameCharacter character){
        this.character = character;
    }

    public abstract void stand();
    public abstract void runLeft();
    public abstract void runRight();
    public abstract void walkLeft();
    public abstract void walkRight();

}

class RunningLeft extends State {
    public RunningLeft(GameCharacter character) {
        super(character);
    }

    public void stand() {character.state = new Stand(character);}
    public void runLeft() {
        Vector3 sub = new Vector3(-.5f,0,0);
        sub.rotate(new Vector3(0,0,1),character.globalRot);
        character.pos.add(sub);
    }
    public void runRight() {character.state = new Stand(character);}
    public void walkLeft() {}
    public void walkRight() {}
}
class RunningRight extends State {
    public RunningRight(GameCharacter character) {
        super(character);
    }

    public void stand() {
        character.state = new Stand(character);
    }
    public void runLeft() { character.state = new Stand(character); }
    public void runRight() {
        Vector3 sub = new Vector3(.5f,0,0);
        sub.rotate(new Vector3(0,0,1),character.globalRot);
        character.pos.add(sub);
    }
    public void walkLeft() {}
    public void walkRight() {}
}
class WalkingLeft extends State {
    public WalkingLeft(GameCharacter character) {
        super(character);
    }

    public void stand() {
        character.state = new Stand(character);
    }
    public void runLeft() {}
    public void runRight() {}
    public void walkLeft() {}
    public void walkRight() {}
}
class WalkingRight extends State {
    public WalkingRight(GameCharacter character) {
        super(character);
    }

    public void stand() {
        character.state = new Stand(character);
    }
    public void runLeft() {}
    public void runRight() {}
    public void walkLeft() {}
    public void walkRight() {}
}

class Stand extends State {

    public Stand(GameCharacter character) {
        super(character);
    }

    public void stand() {}
    public void runLeft() {character.state = new RunningLeft(character);}
    public void runRight() {character.state =  new RunningRight(character);}
    public void walkLeft() {}
    public void walkRight() {}
}
