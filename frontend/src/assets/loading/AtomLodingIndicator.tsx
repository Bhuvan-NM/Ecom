import { Atom } from "react-loading-indicators";

interface AtomLoadingProps {
  size?: string;
  color?: string;
  style?: React.CSSProperties;
  text?: string;
  textColor?: string;
  speedPlus?: number;
  easing?: string;
  className?: string;
}

const AtomLoading: React.FC<AtomLoadingProps> = ({
  size = "small",
  color = "#003459",
  style,
  text,
  textColor,
  speedPlus = 0,
  easing,
  className,
}) => {
  return (
    <div
      className={className}
      style={{
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        minHeight: "100%",
        ...style,
      }}
    >
      <Atom
        size={size}
        color={color}
        speedPlus={speedPlus}
        easing={easing}
      />
      {text && (
        <p style={{ color: textColor || color, marginTop: "10px" }}>{text}</p>
      )}
    </div>
  );
};

export default AtomLoading;
