package com.mygdx.game.characters;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.mygdx.game.core.RenderObject;

/**
 * Created by Alan on 3/29/2016.
 */
public class Engineer extends GameCharacter {

    @Override
    public void load() {
        RenderObject ro = new CaptainRenderObject(this);
        state = new Stand(this);
        super.load();
    }

    @Override
    public void render() {

        if ( Gdx.input.isKeyPressed(Input.Keys.A)){
            state.runLeft();
        }
        else if ( Gdx.input.isKeyPressed(Input.Keys.D)){
            state.runRight();
        }
        else {
            state.stand();
        }
        super.render();
    }
}
