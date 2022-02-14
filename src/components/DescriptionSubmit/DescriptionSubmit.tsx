import { Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack } from "@chakra-ui/react";
import WindowDimensions from "hooks/useDimensions";
import Fade from "react-reveal/Fade";
import st_ds from "./DescriptionSubmit.module.css";

const DescriptionSubmit = ({ 
    title, subtitle, threshold_desc,
    threshold, setThreshold, donate, 
    button_desc,
}: any) => {

    const isWeb = WindowDimensions();

    return (
        <div className={st_ds.description}>
            <div className={st_ds.text}>
                <Fade bottom>
                    {title}
                    <h3>{subtitle}</h3>
                </Fade>
            </div>
            <div className={st_ds.donation_slider}>
                <h6>{threshold_desc}</h6>
                <Slider 
                onChange={(val: number) => setThreshold(val)}
                className={st_ds.slider} 
                aria-label='slider-ex-1' 
                defaultValue={2.5}
                min={0.5}
                max={5.0}
                step={0.1}>
                  <SliderTrack>
                    <SliderFilledTrack bg='#33CCCC'/>
                  </SliderTrack>
                    <SliderMark 
                    color="white" marginBottom="10px"
                    value={0.5} mt='1' fontSize='sm'>
                      0.5
                    </SliderMark>
                    <SliderMark 
                    color="white" marginBottom="10px"
                    value={5.0} mt='1' ml="-5" fontSize='sm'>
                      5.0
                    </SliderMark>
                    <SliderMark
                      value={threshold}
                      textAlign='center'
                      bg='white'
                      color='black'
                      borderRadius="5px"
                      mt='-12'
                      ml='-10'
                      w='12'
                      width="85px"
                      padding="2px 10px"
                      fontWeight="500"
                    >{threshold} UST</SliderMark>
                  <SliderThumb/>
                </Slider>
                {isWeb && <button onClick={ donate }>{button_desc}</button>} 
            </div>             
        </div>
    )
}

export default DescriptionSubmit;