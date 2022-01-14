[论文](https://matthias-research.github.io/pages/publications/PBDBodies.pdf)  
chaos采取的是文中提到的`Velocity Level`，通常的PBD是计算出位置，然后通过位置变化计算出速度，而此处的解法是先计算出速度。  
>PBD updates the velocities after the position solve and then immediately goes to the next substep. However, to handle dynamic
friction and restitution we append a velocity solve  

碰撞解算的思路是计算一个冲量(Impulse)改变速度   
当碰撞的接触点大于 1时，可以转化为一个求平均接触点的程序，只计算一次速度校正(ApplyVelocityCorrection)；或者计算多次  
## 质量系数
$$
w_1\leftarrow \frac{1}{m_1}+(\vec{r_1}\times \vec{n})^T\textbf{I}^{-1}_1(\vec{r_1}\times \vec{n})
$$  
实现上分为两个部分
```cpp
const FMatrix33LP ContactMassInv =
			(Body0.IsDynamic() ? Collisions::ComputeFactorMatrix3(RelativeContactPosition0, FMatrix33LP(Body0.InvI()), FRealLP(Body0.InvM())) : FMatrix33LP(0)) +
			(Body1.IsDynamic() ? Collisions::ComputeFactorMatrix3(RelativeContactPosition1, FMatrix33LP(Body1.InvI()), FRealLP(Body1.InvM())) : FMatrix33LP(0));
const FMatrix33LP ContactMass = ContactMassInv.Inverse();
const FRealLP ContactMassInvNormal = FVec3LP::DotProduct(WorldContactNormal, Utilities::Multiply(ContactMassInv, WorldContactNormal));
const FRealLP ContactMassNormal = (ContactMassInvNormal > FRealLP(SMALL_NUMBER)) ? FRealLP(1) / ContactMassInvNormal : FRealLP(0);
WorldContactMass = ContactMass;
WorldContactMassNormal = ContactMassNormal;
```  
其中  
```cpp
template<typename TRealType>
inline TMatrix33<TRealType> ComputeFactorMatrix3(const TVec3<TRealType>& V, const TMatrix33<TRealType>& M, const TRealType Im)
{
	// Rigid objects rotational contribution to the impulse.
	// Vx*M*VxT+Im
	check(Im > FLT_MIN);
	return TMatrix33<TRealType>(
		-V[2] * (-V[2] * M.M[1][1] + V[1] * M.M[2][1]) + V[1] * (-V[2] * M.M[2][1] + V[1] * M.M[2][2]) + Im,
		V[2] * (-V[2] * M.M[1][0] + V[1] * M.M[2][0]) - V[0] * (-V[2] * M.M[2][1] + V[1] * M.M[2][2]),
		-V[1] * (-V[2] * M.M[1][0] + V[1] * M.M[2][0]) + V[0] * (-V[2] * M.M[1][1] + V[1] * M.M[2][1]),
		V[2] * (V[2] * M.M[0][0] - V[0] * M.M[2][0]) - V[0] * (V[2] * M.M[2][0] - V[0] * M.M[2][2]) + Im,
		-V[1] * (V[2] * M.M[0][0] - V[0] * M.M[2][0]) + V[0] * (V[2] * M.M[1][0] - V[0] * M.M[2][1]),
		-V[1] * (-V[1] * M.M[0][0] + V[0] * M.M[1][0]) + V[0] * (-V[1] * M.M[1][0] + V[0] * M.M[1][1]) + Im);
}
```  
可以看出一开始计算的是  
$$
\frac{1}{m_1}+\vec{r_1}^T\textbf{I}^{-1}_1\vec{r_1}
$$
## CalculateContactVelocityError
先看第一部分，不计算摩擦力   
对每个接触对(contact pair)，计算出相对法线速度和切线速度  
$$
\vec{v}\leftarrow (\vec{v_1}+\omega_1\times \vec{r_1})-(\vec{v_2}+\omega_2\times \vec{r_2})\\
v_n\leftarrow \vec{n}\cdot\vec{v}\\
\vec{v_t}\leftarrow \vec{v}-\vec{n}v_n
$$


```cpp
const FVec3LP ContactVelocity0 = Body0.V() + FVec3LP::CrossProduct(Body0.W(), RelativeContactPosition0);
const FVec3LP ContactVelocity1 = Body1.V() + FVec3LP::CrossProduct(Body1.W(), RelativeContactPosition1);
const FVec3LP ContactVelocity = ContactVelocity0 - ContactVelocity1;
const FRealLP ContactVelocityNormal = FVec3LP::DotProduct(ContactVelocity, WorldContactNormal);
```  

## CalculateVelocityCorrectionImpulse
$$
\vec{p}=\frac{\Delta \vec{v}}{w_1+w_2}
$$
## ApplyVelocityCorrection
$$
\vec{v_1}\leftarrow \vec{v_1}+\vec{p}/m_1\\
\omega_1\leftarrow\omega_1+\textbf{I}^{-1}_1(\vec{r_1}\times \vec{p})
$$
```cpp
if (Body0.IsDynamic())
{
	const FVec3LP AngularImpulse = FVec3LP::CrossProduct(ManifoldPoint.RelativeContactPosition0, Impulse);
	Body0.ApplyVelocityDelta(Body0.InvM() * Impulse, Body0.InvI() * AngularImpulse);
}
```