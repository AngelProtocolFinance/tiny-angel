import WindowDimensions from "hooks/useDimensions";
import st_sw from "./SectionWrapper.module.css";

const SectionWrapper = ({ children, type }: any) => {

    const isWeb = WindowDimensions();

    return (
        <section className={st_sw.outer_container}>
            <div className={st_sw.inner_container} style={{ 
                flexDirection: isWeb ? "row" : type === "reward" ? "column" : "column-reverse" 
            }}>
                {children}
            </div>
        </section>
    )
}

export default SectionWrapper;