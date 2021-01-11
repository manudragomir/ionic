import React from 'react'
import { createAnimation, Animation, IonItem } from '@ionic/react';


export function playIconAnimation(iconAnimated: Element | null) {
    //console.log(iconAnimated);
    if (iconAnimated) {
      const animation = createAnimation()
        .addElement(iconAnimated)
        .duration(1000) 
        .direction('alternate')
        .iterations(2)
        .keyframes([
          { offset: 0, transform: 'scale(1)', opacity: '1' },
          { offset: 0.5, transform: 'scale(2)', opacity: '0.5'},
          { offset: 1, transform: 'scale(1)', opacity: '1'}
        ]);
        animation.play();
    }
}

export function playGroupAnimation(animationsContainer: Animation[]){
    const parentAnimation = createAnimation()
        .duration(100)
        .direction('alternate')
        .iterations(6)
        .addAnimation(animationsContainer);
    parentAnimation.play(); 
}



export function createShakingAnimation(animatedElem: Element){
    const MAX_TRANSLATE = 10;
    const animation = createAnimation()
        .addElement(animatedElem)
        .fromTo('transform', 'translateX(0)', `translateX(${MAX_TRANSLATE}vw)`)
        .fromTo('color', 'var(--background-color)', 'red');
    return animation;
}

function createEnteringAnimation(animatedElem: Element){
    const MAX_TRANSLATE = 10;
    const animation = createAnimation()
        .addElement(animatedElem)
        .duration(200)
        .direction('alternate')
        .fromTo('transform', 'translateY(0)', `translateY(${MAX_TRANSLATE}vw)`)
        .fromTo('color', 'var(--background-color)', 'blue')
        .fromTo('opacity', '1', '0.5')
        .iterations(2);
    return animation;
}

export async function playChainAnimation(chainedElements: Element[]){
    let chainedAnimations: Animation[] = [];
    chainedElements.forEach((element: Element) => { 
        chainedAnimations.push(createEnteringAnimation(element));
    });
    for(let i = 0; i < chainedAnimations. length; i++){
        await chainedAnimations[i].play();
    }
}

