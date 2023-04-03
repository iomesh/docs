---
id: localpv-manager
title: IOMesh LocalPV Manager
sidebar_label: IOMesh LocalPV Manager
---

## Introduction

### What is IOMesh LocalPV Manager

IOMesh LocalPV Manager is a CSI driver for managing local storage on Kubernetes worker nodes. You can create local PVs using a directory or block device on the node for pod use.

IOMesh LocalPV has the following advantages compared to [Kubernetes HostPath Volume](https://kubernetes.io/docs/concepts/storage/volumes/#hostpath) and [Kubernetes native local PV](https://kubernetes.io/docs/concepts/storage/volumes/#local):

- Dynamically provisions PVs to allow flexible node storage access through StorageClass, PVC, and PV without the need for administrators to pre-provision static PVs. 

- Create persistent volumes using directories or block devices, offering more flexibility compared to Kubernetes local PVs that are limited to the directory.

- 当使用节点上的目录作为后端存储时，IOMesh LocalPV 支持 PV 级别的容量限额

- A scheduler that works independently is created to ensure successful scheduling of pods in situations where there is not enough local storage and to balance capacity across the entire cluster.

### Architecture

![IOMesh LocalPV Manager](https://user-images.githubusercontent.com/12667277/217775597-7261e106-1407-4adf-92df-a1c99e447273.svg)

IOMesh LocalPV Manager is comprised of components: Controller Driver, Node Driver, and Node Disk Manager.

**Controller Driver** 我们自己的，还是 k8s 的

标准的 CSI Controller Server 实现，与 kube-apiserver 交互。负责 LocalPV 的创建和删除，以及 PV 与本地目录或设备的关系映射，每个 K8s Worker 节点都会有一个 Controller Driver 实例.


每一个 CSI driver 都会有 1 个 controller component?

**Node Driver** 我们自己的，还是 k8s 的

标准的 CSI Node Server 实现，与 kubelet 交互。负责 LocalPV 的挂载与格式化，每个 K8s Worker 节点都会有一个 Node Driver 实例

**Node Disk Manager**

`Node Disk Manager` is responsible for discovering node block devices and abstract block devices into BlockDevice objects, providing a BlockDeviceClaim mechanism to ensure that a block device is exclusive to a particular Pod.

## Deployment & Operations


## IOMesh Hostpath LocalPV

如果用户的应用需要独占盘或者直接挂裸块设备，就是 IOMesh Device LocalPV。其他的是 IOMesh Hostpath LocalPV

IOMesh Hostpath LocalPV allows Kubernetes PVs to be created based on a directory on a node to be made available to Pods, and supports PV-level capacity limits.

### Create IOMesh Hostpath LocalPV

1. Create a StorageClass. 

    After IOMesh LocalPV Manager is installed, a storage class with volumeType of hostpath type will be created by default, you can create a custom storage class according to your needs, such as changing the basePath path or enabling the capacity limit.

    ```yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
    name: iomesh-localpv-manager-hostpath
    parameters:
    volumeType: hostpath
    basePath: /var/iomesh/local
    enableQuota: "false"
    provisioner: com.iomesh.iomesh-localpv-manager
    reclaimPolicy: Delete
    volumeBindingMode: WaitForFirstConsumer
    ```
    | Field | Description      |
    | -------- | ---------------- |
    | `parameters.volumeType`  | Localpv type, including `hostpath` and `device`.                    |
    | `parameters.basePath`    | localpv 将被创建在节点上 parameters.basePath 声明的目录中，如果 parameters.basePath 不存在会被自动创建。**parameters.basePath 的格式必须是绝对路径** |
    | parameters.enableQuota | 是否开启目录限额，默认关闭                                       |
    | volumeBindingMode      | pvc 绑定模式，仅支持 `WaitForFirstConsumer`              |

2. Create a PVC with the following content. 

    - Create a YMAL config `iomesh-localpv-hostpath-pvc.yaml` with the following content.
        ```yaml
        # iomesh-localpv-hostpath-pvc.yaml
        kind: PersistentVolumeClaim
        apiVersion: v1
        metadata:
        name: iomesh-localpv-hostpath-pvc
        spec:
        storageClassName: iomesh-localpv-manager-hostpath
        accessModes:
            - ReadWriteOnce
        resources:
            requests:
            storage: 2G
        ```
    - Apply the YAML config to create the PVC.
        ```shell
        kubectl apply -f iomesh-localpv-hostpath-pvc.yaml
        ```

    - View the PVC.
        ```shell
        kubectl get pvc iomesh-localpv-hostpath-pvc
        ```
      You will see the PVC in a `Pending` state as the `volumeBindingMode` of StorageClass is configured as `WaitForFirstConsumer`, and only when the Pod is bound to this PVC, the corresponding PV will be created on the node to which the pod is scheduled, and the status of this PVC will become `Bound`.

        ```shell
        NAME                          STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS               AGE
        iomesh-localpv-hostpath-pvc   Pending                                      localpv-manager-hostpath   1m12s
        ```
3. Create a pod and bind it to the PVC created in the previous step.

    - Create a YAML config `iomesh-localpv-hostpath-pod.yaml` with the following content. 准备 Pod 配置，将 PVC 挂载到 Pod 内的 `/mnt/iomesh/localpv` 目录 
        ```yaml
        # iomesh-localpv-hostpath-pod.yaml
        apiVersion: v1
        kind: Pod
        metadata:
        name: iomesh-localpv-hostpath-pod
        spec:
        volumes:
        - name: iomesh-localpv-hostpath
            persistentVolumeClaim:
            claimName: iomesh-localpv-hostpath-pvc
        containers:
        - name: busybox
            image: busybox
            command:
            - sh
            - -c
            - 'while true; do sleep 30; done;'
            volumeMounts:
            - mountPath: /mnt/iomesh/localpv
            name: iomesh-localpv-hostpath
        ```
    - Apply the YAML config to create the pod.
    
        ```shell
        kubectl apply -f iomesh-localpv-hostpath-pod.yaml
        ```
    - Verify that the pod is in the `Running` state.

        ```shell
        kubectl get pod iomesh-localpv-hostpath-pod
        ```

    - Verify that the PVC is in `Bound` state and its corresponding PV was created.
        ```shell
        kubectl get pvc iomesh-localpv-hostpath-pvc
        ```
        ```output
        NAME                          STATUS   VOLUME                                     CAPACITY   ACCESS MODES     
        iomesh-localpv-hostpath-pvc   Bound    pvc-ab61547e-1d81-4086-b4e4-632a08c6537b   2G         RWO           
        ```

    - Get the YAML config to see configurations of this PV. Note that the PV name is obtained in the previous step. (这一步的目的是啥)
        ```shell
        kubeclt get pv pvc-ab61547e-1d81-4086-b4e4-632a08c6537b -o yaml
        ```
        ```yaml
        apiVersion: v1
        kind: PersistentVolume
        metadata:
        ...
        spec:
        ...
        csi:
            driver: com.iomesh.iomesh-localpv-manager
            volumeAttributes:
            basePath: /var/iomesh/local
            csi.storage.k8s.io/pv/name: pvc-ab61547e-1d81-4086-b4e4-632a08c6537b
            csi.storage.k8s.io/pvc/name: iomesh-localpv-hostpath-pvc
            csi.storage.k8s.io/pvc/namespace: default
            enableQuota: "false"
            nodeID: iomesh-k8s-0
            quotaProjectID: "0"
            storage.kubernetes.io/csiProvisionerIdentity: 1675327643130-8081-com.iomesh.localpv-manager
            volumeType: hostpath
            volumeHandle: pvc-ab61547e-1d81-4086-b4e4-632a08c6537b
        nodeAffinity:
            required:
            nodeSelectorTerms:
            - matchExpressions:
                - key: topology.iomesh-localpv-manager.csi/node
                operator: In
                values:
                - iomesh-k8s-0
        ...
        ```

        | Field | Description  |
        | -------- | ------ |
        | `spec.csi.volumeAttributes.basePath` | `basePath` created by IOMesh local PV. localpv 创建的 basePath，该 PV 对应的目录被创建在 `iomesh-k8s-0` 这个节点的 `/var/iomesh/local/pvc-ab61547e-1d81-4086-b4e4-632a08c6537b` 路径 |
        | `spec.nodeAffinity`| Node affinity for the PV. Once created, this PV will be bound to the specified node and will not move to another node.|      

### Enabling Capacity Limit

In the above example, an IOMesh local PV is created with a capacity of 2 G, corresponding to a directory on the node, and by default does not limit the amount of data written into this directory, allowing for more than written data of over 2 G. However, if you have requirement for capacity isolation, you may enable capacity limit for this IOMesh local PV.

**Prerequisite**

IOMesh LocalPV Manager 的容量限额功能基于 xfs 文件系统的 xfs_quota 特性实现，当限额功能开启后， localpv 在被创建时会同时配置 xfs quota，以确保 PVC 中声明的容量大小是真实生效的.

**Procedure**

1. 假设 basePath 为 /var/iomesh/localpv-quota (跟上面的例子不一样), 创建对应目录

    ```shell
    mkdir -p /var/iomesh/localpv-quota
    ```
2. 将待挂载的磁盘（假设为 /dev/sdx）格式化为 xfs 文件系统

    ```shell
    sudo mkfs.xfs /dev/sdx
    ```
3. 挂载磁盘到 basePath（假设 basePath 为 /var/iomesh/localpv-quota），通过挂载选项开启 xfs 的  prjquota 特性

    ```shell
    mount -o prjquota /dev/sdx /var/iomesh/localpv-quota
    ```
> _NOTE_: 如果希望使用一个已存在的 xfs 挂载点作为 basePath，则需要先 umount 该挂载点，然后重新用 `prjquota` 挂载选项再次挂载。（xfs的 `prjquota` 挂
载选项不支持在已有挂载点上直接 remount）
> _NOTE_: 为了防止节点重启后挂载信息丢失，需要将挂载信息持久化到 /etc/fstab 配置文件中

4. 使用该挂载点作为  basePath 创建 StorageClass，并将 `parameters.enableQuota` 字段设为 "true"

    ```yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
    name: iomesh-localpv-manager-hostpath
    parameters:
    volumeType: hostpath
    basePath: /var/iomesh/localpv-quota
    enableQuota: "true"
    provisioner: com.iomesh.iomesh-localpv-manager
    reclaimPolicy: Delete
    volumeBindingMode: WaitForFirstConsumer
    ```
4. 接着就可以使用该 StorageClass 创建 PVC，步骤与上一章节描述相同

> _NOTE_: 当前版本的 IOMesh LocalPV Manager 尚未支持调度器扩展（见[调度器扩展](scheduler)章节）, Pod 有可能被调度到容量限额不足的节点上，此时需要手动修改 Pod 的节点亲和性使其重新调度到容量限额满足需求的节点上。