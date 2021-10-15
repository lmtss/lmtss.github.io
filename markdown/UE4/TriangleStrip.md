`RHIutilities.h`中`GetVertexCountForPrimitiveCount`函数，根据`PrimitiveType`计算出传给api的值  
```cpp
inline uint32 GetVertexCountForPrimitiveCount(uint32 NumPrimitives, uint32 PrimitiveType)
{
	static_assert(PT_Num == 38, "This function needs to be updated");
	uint32 Factor = (PrimitiveType == PT_TriangleList)? 3 : (PrimitiveType == PT_LineList)? 2 : (PrimitiveType == PT_RectList)? 3 : (PrimitiveType >= PT_1_ControlPointPatchList)? (PrimitiveType - PT_1_ControlPointPatchList + 1) : 1;
	uint32 Offset = (PrimitiveType == PT_TriangleStrip)? 2 : 0;

	return NumPrimitives * Factor + Offset;

}
```  
所以这种情况下，NumPrimitives的值就不是三角形的数量了  
`offset`应该是对应最开始的两个顶点