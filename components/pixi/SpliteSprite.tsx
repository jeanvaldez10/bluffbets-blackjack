import { getIconTexture } from "@/lib/utils/pixiAssets";
import { TextStyle } from "pixi.js";

type SpliteSpriteProps = {
    isMobile: boolean;
    onSplit?: () => void;
    fontSize: number;
    disabled?: boolean
}

function SpliteSprite({ isMobile, onSplit, fontSize, disabled }: SpliteSpriteProps) {
    const textOverlayStyle = new TextStyle({
        fontFamily: "Minecraft, monospace",
        fontSize: fontSize,
        fill: disabled ? "#666666" : "#000000",
        align: "center",
        fontWeight: "500",
        letterSpacing: 0,
        lineHeight: 1,
    });
    return (
        <pixiContainer
            x={0}
            y={0}
            zIndex={1000}
            onPointerTap={onSplit}
            eventMode={disabled ? "none" : "static"}
            cursor={disabled ? "not-allowed" : "pointer"}
        >
            <pixiSprite
                texture={getIconTexture("split")}
                x={0}
                y={0}
                width={isMobile ? 80 : 122}
                height={isMobile ? 40 : 50}
                zIndex={1000}
                onPointerTap={!disabled ? onSplit : undefined}
                anchor={{ x: 0.5, y: 0.5 }}
            />
            <pixiText
                text="SPLIT"
                x={0}
                y={0}
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={1001}
                style={textOverlayStyle}
            />
        </pixiContainer>
    );
}

export default SpliteSprite;