package com.mygdx.game.characters;

import com.badlogic.gdx.math.Vector3;
import com.mygdx.game.characters.State.Stand;
import com.mygdx.game.characters.State.State;
import com.mygdx.game.core.RenderObject;

/**
 * Created by Alan on 3/29/2016.
 */
public class Captain extends GameCharacter {

    @Override
    public void load() {
        RenderObject ro = new CaptainRenderObject(this);
        center = new Vector3(20,20,0);
        state = new Stand(this);
        walkSpeed = .3f;
//        ai = new RandomWalkAI(this);
        super.load();
    }

    @Override
    public void render() {

//        ai.update();


        super.render();
    }
}
