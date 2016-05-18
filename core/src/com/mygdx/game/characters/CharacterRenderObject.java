package com.mygdx.game.characters;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.Animation;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.utils.Array;
import com.mygdx.game.characters.State.*;
import com.mygdx.game.core.GameNode;
import com.mygdx.game.core.RenderObject;

/**
 * Created by Kristen on 5/10/2016.
 */
public abstract class CharacterRenderObject extends RenderObject {
    public Array<TextureRegion> standreg;
    TextureRegion tr;
    Array<TextureRegion> runTrs;
    Animation right, left, stand, wleft, wright;
    float stateTime;

    Texture walk,standTex;
    public CharacterRenderObject(GameNode node, String spriteSheet) {
        super(node, spriteSheet);
    }

    @Override
    public void draw(SpriteBatch batch) {
        Animation play = stand;

        if (myNode.state.getClass().equals(Stand.class))
        {
            play = stand;
        }
        if ( myNode.state.getClass().equals(RunningLeft.class))
        {
            play = left;
        }
        if ( myNode.state.getClass().equals(RunningRight.class))
        {
            play = right;
        }
        if ( myNode.state.getClass().equals(WalkingLeft.class))
        {
            play = wleft;
        }
        if ( myNode.state.getClass().equals(WalkingRight.class))
        {
            play = wright;
        }


        stateTime += Gdx.graphics.getDeltaTime();
//        batch.draw(play.getKeyFrame(stateTime, true), 0,0);
//        batch.draw(play.getKeyFrame(stateTime, true),0, 0, 45, 45);
        batch.draw(play.getKeyFrame(stateTime, true), myNode.globalPos.x,myNode.globalPos.y, 0,0,40,40,1,1,myNode.globalRot);
    }
}
