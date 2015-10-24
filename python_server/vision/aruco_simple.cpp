#include <iostream>
#include <aruco/aruco.h>
#include <aruco/cvdrawingutils.h>
#include <opencv2/highgui/highgui.hpp>
#include <sstream>

using namespace cv;
using namespace aruco;
int main(int argc,char **argv)
{
    try
    {
        if (argc!=2) {
            cerr<<"Usage: in.jpg "<<endl;
            return -1;
        }
        MarkerDetector MDetector;
        vector<Marker> Markers;
        //read the input image
        cv::Mat InImage;
        InImage=cv::imread(argv[1]); 
        //Ok, let's detect
        MDetector.detect(InImage,Markers);
        std::stringstream ss;
        ss<<"[";
        //for each marker, draw info and its boundaries in the image
        for (unsigned int i=0;i<Markers.size();i++) {
            ss<<"{\"id:\""<<Markers[i].id<<"\",positions:[";
            for (int j = 0; j < 4; j++)
                ss << "{\"x\":" << Markers[i][j].x << ",\"y\":" << Markers[i][j].y << "},";
            ss<<"]}";
            //Markers[i].draw(InImage,Scalar(0,0,255),2);
            if(i != Markers.size()-1) ss<<",";
        }
        ss<<"]";
        cout << ss.str()<<endl;
        //cv::imwrite("out.jpg",InImage);
        //cv::waitKey(0);//wait for key to be pressed
    } catch (std::exception &ex)
    {
        cout<<"Exception :"<<ex.what()<<endl;
    }
}
 