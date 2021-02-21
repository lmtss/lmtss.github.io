同步部分
# Present and Graphics
使用信号来确保交换链可用后，再令cmdBuffer生效，以及在cmdBuffer结束后，再生效present队列  
```cpp
vkAcquireNextImageKHR(device, swapChain, INT64_MAX, imageAvailableSemaphore, VK_NULL_HANDLE, &imageIndex);
//信号量imageAvailableSemaphore
VkSubmitInfo submit = {};
submit.pWaitSemaphores = {imageAvailableSemaphore};
//在提交cmdBuffer的info中添加需要等待的信号量
submit.pSignalSemaphores = {renderFinishSemaphore};
//
VkPresentInfoKHR presentInfo = {};
presentInfo.pWaitSemaphores = {renderFinishSemaphore};
//提交到present队列时，等待renderFinishSemaphore信号
```
不过，这并不足够，当cpu运行的过快时，会有很多cmdBuffer提交了，但并未执行完成
# Frames in flight
若在`loop`部分使用如下写法  
``` cpp
void draw(){
    //渲染xxx

    vkQueueWaitIdle(presentQueue);
}
```
这会让全部工作完成，并呈现结束后，才进行下一帧。从效果来看是正确的，但没有效率，因为其他部分会是空闲的。  

# Fence
此处设置一个`int`描述预计中有多少个frame处于竞争状态，这个数量和交换链中framebuffer的数量并不一致
```cpp
const int MAX_FRAME_IN_FLIGHT = 2;
```
创建`MAX_FRAME_IN_FLIGHT`数量的信号以及fence
```cpp
void draw(){
    if(vkQueueSubmit(graphicsQueue, 1, &submitInfo, fences[]))
}
```
# 对于此处
我查看了不同的教程，以及UE4的交换链部分的代码，发现实现都不一样。  
* UE4是按照交换链中framebuffer数量创建的信号量以及fence
* 此教程是按照所需的、可能发生竞争的数量来创建
* 也有一些教程，按照交换链framebuffer数量创建栅栏，但信号量只有1个