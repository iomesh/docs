---
id: external-iscsi
title: Use IOMesh as iSCSI Target
sidebar_label: Use IOMesh as iSCSI Target
---

IOMesh 支持直接对外提供 iSCSI 服务，用户可以通过创建 PVC 的形式创建 iSCSI LUN(下文称之为 external iSCSI LUN)，并在 K8s 集群外使用任意 iSCSI 客户端(如 `open-iscsi`)来连接。

## 配置稳定的 iSCSI 接入点
为保证 iSCSI 服务接入点高可用且 IP 地址稳定，IOMesh 利用 K8s 的 LoadBalancer type service 作为 iSCSI 服务接入点。该 service 需要用户创建，具体步骤根据 IOMesh 集群部署环境有所不同：
*  IOMesh 集群部署在 GCP，AWS，Azure 等 K8s 原生支持 LoadBalancer type service 的 cloud provider 中(详细的 cloud provider 列表见 [internal-load-balancer](https://kubernetes.io/docs/concepts/services-networking/service/#internal-load-balancer))，则参考 `In-Tree LoadBalancer` 章节
* 其他部署场景（如 bare metal）参考 `Out-Tree LoadBalancer` 章节

<!--DOCUSAURUS_CODE_TABS-->

<!--In-Tree LoadBalancer-->
1. 创建文件 `iomesh-access-lb-service.yaml` 并写入如下内容:

    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: iomesh-access-lb
      namespace: iomesh-system
    spec:
      ports:
      - name: iscsi
        port: 3260
        protocol: TCP
        targetPort: 3260
      selector:
        app.kubernetes.io/name: iomesh-iscsi-redirector
      type: LoadBalancer
    ```

2. 应用 service 配置

    ```bash
    kubectl apply -f iomesh-access-lb-service.yaml
    ```

3. 检查 service 状态

    ```bash
    kubectl get service iomesh-access-lb -n iomesh-system
    ```
K8s 会调用对应 IaaS platform 的接口为你创建的 service 分配一个 external-ip ，作为 LoadBalancer 的入口。

最后，执行 `kubectl edit iomesh -n iomesh-system`，将 `spec.redirector.iscsiVirtualIP` 设置为 `iomesh-access-lb` service 的 external-ip，保存后 `iomesh-iscsi-redirector` Pod 会自动重启生效设置。

<!--Out-Tree LoadBalancer-->
1. 创建文件 `iomesh-access-lb-service.yaml` 并写入如下内容:

    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: iomesh-access-lb
      namespace: iomesh-system
    spec:
      ports:
      - name: iscsi
        port: 3260
        protocol: TCP
        targetPort: 3260
      selector:
        app.kubernetes.io/name: iomesh-iscsi-redirector
      type: LoadBalancer
    ```

2. 应用 service 配置

    ```bash
    kubectl apply -f iomesh-access-lb-service.yaml
    ```

3. 检查 service 状态

    ```bash
    kubectl get service iomesh-access-lb -n iomesh-system
    ```

由于 IOMesh 运行在 bare metal 环境，或其他非 K8s 原生支持 LoadBalancer type service 的 cloud provider 中，K8s 不提供 load balancer 的默认实现，创建的 LoadBalancer service 将一直处于 pending 状态。此时需要在 K8s 集群中安装 `MetalLB` 来作为默认的 load balancer 实现，安装和配置方式如下
1. 确保集群满足 `MetalLB` 的[前置安装条件](https://metallb.universe.tf/installation/#preparation)

2. 安装 `MetalLB`

    ```bash
    helm repo add metallb https://metallb.github.io/metallb
    helm install metallb metallb/metallb --version 0.12.1
    ```

3. 创建 `MetalLB` ConfigMap 文件 `metallb-config.yaml`，设置 `MetalLB` 的工作模式为 layer2 (基于 arp)， 并为 `MetalLB` 分配 ip 池
    ```yaml
    apiVersion: v1
    kind: ConfigMap
    metadata:
      namespace: iomesh-system
      name: metallb
    data:
      config: |
        address-pools:
        - name: iomesh-access-address-pools
          protocol: layer2
          addresses:
          - <fill-in-your-ip-address-pool-here> # eg: "192.168.1.100-192.168.1.110" or "192.168.2.0/24"
    ```
将 `<fill-in-your-ip-address-pool-here>` 部分替换为物理网络中未被使用的 IP 池，可以使用 ip-range 的形式，如 "192.168.1.100-192.168.1.110"，也可以使用子网掩码的形式，如 "192.168.2.0/24"

4. 应用 ConfigMap 配置

    ```bash
    kubectl apply -f metallb-config.yaml
    ```

5. 检查 service 状态，确保 `MetalLB` 分配了 IP 池中的 external-ip

    ```bash
    watch kubectl get service iomesh-access-lb -n iomesh-system
    ```

<br>
最后，执行 `kubectl edit iomesh -n iomesh-system`，将 `spec.redirector.iscsiVirtualIP` 设置为 `iomesh-access-lb` service 的 external-ip，保存后 `iomesh-iscsi-redirector` Pod 会自动重启生效设置。
<!--END_DOCUSAURUS_CODE_TABS-->

## 使用 PVC 创建 external iSCSI LUN
使用 PVC 创建 external iSCSI LUN 需要在 PVC 中增加两个 annotation 字段， 字段说明和完整的例子如下

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: external-iscsi
  annotations:
    # 标记该 PVC 对应一个集群外部使用的 LUN
    iomesh.com/external-use: "true"
    # 设置 LUN 的 initiator iqn acl，不配置该字段代表禁止所有 initiator login。PVC 的 accessModes 为 RWO 时该字段的值有
    # 且只能有一条，PVC 的 accessModes 为 RWX 时该字段的值可以有多条，用逗号隔开。放行所有 iqn 配置为 "*/*"
    iomesh.com/iscsi-lun-iqn-allow-list: "iqn.1994-05.com.example:a6c97f775dcb"
spec:
  storageClassName: iomesh-csi-driver
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

> **_NOTE_:** `iomesh.com/iscsi-lun-iqn-allow-list` 字段可以在 PVC 创建时设置，也可以在创建后设置，支持动态更新。iSCSI client 的 iqn 一般可以通过 `cat /etc/iscsi/initiatorname.iscsi` 获得。

PVC 创建完成并且进入 Bound 状态后，查看对应 PV 的 `spec.volumeAttributes.iscsiEntrypoint` 字段

```bash
kubectl get pv pvc-d84b4657-7ab5-4212-9270-ce40e6a1356a -o jsonpath='{.spec.csi.volumeAttributes.iscsiEndpoint}'
# output
iscsi://cluster-loadbalancer-ip:3260/iqn.2016-02.com.smartx:system:54e7022b-2dcc-4b43-800c-e52b6fad07d3/1
```
在这个例子中：
* iSCSI Portal 的 IP 和端口是 cluster-loadbalancer-ip 和 3260，其中 cluster-loadbalancer-ip 在实际使用时替换为上文配置的 iomesh-access-lb service external-ip
* Target name 是 iqn.2016-02.com.smartx:system:54e7022b-2dcc-4b43-800c-e52b6fad07d3
* LUN ID 是 1

通过以上信息，可以使用任意 iSCSI client 来连接。假设 cluster-loadbalancer-ip 为 192.168.25.101，以 `open-iscsi` 为例:
```bash
iscsiadm -m discovery -t sendtargets  -p 192.168.25.101:3260 --discover
iscsiadm -m node -T iqn.2016-02.com.smartx:system:54e7022b-2dcc-4b43-800c-e52b6fad07d3 -p 192.168.25.101:3260  --login
```

## 删除 PVC
为了安全起见，IOMesh 不允许删除 `iomesh.com/iscsi-lun-iqn-allow-list` 字段值不为空的 PVC。如果要删除 PVC，需要先保证 `iomesh.com/iscsi-lun-iqn-allow-list` 字段的值为 `""` 或者删除 `iomesh.com/iscsi-lun-iqn-allow-list` 字段, 再进行删除操作。PVC 删除后 external iSCSI LUN 是否保留取决于 PVC 使用的 StorageClass 对应的 `reclaimPolicy` 字段。
