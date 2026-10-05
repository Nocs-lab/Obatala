import React from "react";
import { useDrawer } from "../context/DrawerContext";
import { Icon, close } from "@wordpress/icons";
import { Button } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

const SlidingDrawer = () => {
    const { isOpen, toggleDrawer, content } = useDrawer();

    return (
        <>
            {isOpen && (
                <div className="wp-drawer">
                    <Button className="close-button"
                        label={__('Close', 'obatala')}
                        icon={<Icon icon={close} size={24} onClick={toggleDrawer} />}
                    ></Button>

                    {/* Renderiza o conteúdo dinâmico */}
                    <div>{content}</div>
                </div>
            )}
        </>
    );
};

export default SlidingDrawer;
