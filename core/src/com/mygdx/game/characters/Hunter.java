package com.mygdx.game.characters;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.core.RenderObject;

/**
 * Created by Alan on 3/29/2016.
 */
public class Hunter extends GameCharacter {

    @Override
    public void load() {
        RenderObject ro = new HunterRenderObject(this);
        center = new Vector3(20,20,0);
        state = new Stand(this);
        walkSpeed = .7f;
        ai = new RandomWalkAI(this);
        super.load();
    }

    @Override
    public void render() {

        ai.update();


        super.render();
    }
}
