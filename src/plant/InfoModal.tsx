import React, { useEffect, useState } from 'react';
import { createAnimation, IonModal, IonButton, IonLabel } from '@ionic/react';

export interface ModalProps{
    isModalOpen: boolean;
    onDismissFn: () => void;
}

export const InfoModal: React.FC<ModalProps> = ({isModalOpen, onDismissFn}) => {
  const [showModal, setShowModal] = useState<boolean>(isModalOpen);

  useEffect( () => {
      setShowModal(isModalOpen);
  }, [isModalOpen]);

  const enterAnimation = (baseEl: any) => {
    const backdropAnimation = createAnimation()
      .addElement(baseEl.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = createAnimation()
      .addElement(baseEl.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '1', transform: 'scale(1)' }
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(500)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  }

  const leaveAnimation = (baseEl: any) => {
    return enterAnimation(baseEl).direction('reverse');
  }

  return (
    <>
      <IonModal isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation} 
                onDidDismiss={onDismissFn}>
        <IonLabel position="floating" className="ion-text-wrap ion-text-center" style={{margin: "0", 
                                                                                        position: "absolute",
                                                                                        top: "50%",
                                                                                        left: "50%",
                                                                                        transform: "translate(-50%, -50%)"}}>
            On this page, you can edit the details about your plant. You can add a photo of your plant,
            by taking a picture with your camera and now you can even set the precise location by using Google Maps.
        </IonLabel>
        <IonButton onClick={() => setShowModal(false)}>Okay</IonButton>
      </IonModal>
    </>
  );
};
