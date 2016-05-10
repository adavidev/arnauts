package com.mygdx.game.characters;

import com.mygdx.game.core.GameNode;

/**
 * Created by Alan on 3/29/2016.
 */
public abstract class GameCharacter extends GameNode {
//    public AnimatedSprite stand, walk, climb, climbPause, fall, die;
    public int walkSpeed, climbSpeed;

    public GameCharacter()
    {
        super();
    }

//    public boolean canOperate(GameObject go)
//    {
//        return false;
//    }

//    public static Engineer e = new Engineer();
//    public static Soldier s = new Soldier();
//    public static Pilot p = new Pilot();

}
