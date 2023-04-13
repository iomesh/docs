---
id: external-storage
title: External Storage outside Kubernetes
sidebar_label: External Storage outside Kubernetes
---

Besides offering storage within the Kubernetes cluster, IOMesh can also provide storage to external clients through the IOMesh CSI driver or by functioning as an iSCSI target.

## Configure iSCSI Access Point

In order to utilize IOMesh storage via the CSI driver or iSCSI target, it is necessary to first configure an iSCSI access point.

To guarantee a consistent and functional IP as the iSCSI service access point, IOMesh employs `iomesh-access` service with a service type of `LoadBalancer` to access the iSCSI service. This service must have an IP externally exposed, and the specific method for configuring this external IP will vary depending on the cloud environment in which IOMesh is deployed.

- For IOMesh deployed in [LoadBalancer-supported cloud environments]((https://kubernetes.io/docs/concepts/services-networking/service/#internal-load-balancer)), see `In-Tree LoadBalancer`.
- For IOMesh deployed on bare metal or other LoadBalancer-not-supported cloud environments, see `Out-of-Tree LoadBalancer`.

**Procedure**

<!--DOCUSAURUS_CODE_TABS-->

<!--In-Tree LoadBalancer-->

If IOMesh is deployed in a cloud environment that supports `LoadBalancer`, Kubernetes will automatically call the API of the cloud provider and assign an external IP to `iomesh-access` service 

1. Check the status of `iomesh-access` service, ensuring it has been assigned an external IP.

    ```bash
    kubectl get service iomesh-access -n iomesh-system
    ```
    ```output
    NAME            TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)                                                          AGE
    iomesh-access   LoadBalancer   10.96.22.212   192.168.2.1     3260:32012/TCP,10206:31920/TCP,10201:31402/TCP,10207:31802/TCP   45h

2. Set `spec.redirector.iscsiVirtualIP` to the external IP of `iomesh-access` service by running the following command. Once edited, the `iomesh-iscsi-redirector` pod will automatically restart to make the modification take effect. 
    ```bash
    kubectl edit iomesh -n iomesh-system
    ```

    > **_NOTE_:** `spec.redirector.iscsiVirtualIP` must be the same as the external IP. If the external IP is changed, update `spec.redirector.iscsiVirtualIP`.

<!--Out-of-Tree LoadBalancer-->
In case IOMesh is deployed on bare metal or any cloud environment that does not support Kubernetes `LoadBalancer`, you will need to install `MetallLB` as the default `LocalBalancer` in the Kubernetes cluster.

1. Verify that the Kubernetes cluster meets [the `MetalLB` installation requirements](https://metallb.universe.tf/installation/#preparation).

2. Install `MetalLB`.
    ```shell
    helm repo add metallb https://metallb.github.io/metallb
    helm install metallb metallb/metallb --version 0.12.1 -n iomesh-system
    ```
3. Create a `MetalLB` YAML configMap `metallb-config.yaml`. 

    Set `protocol` to `layer2`. Fill in an IP pool in `addresses`. The IP pool must be an IP range like "192.168.1.100-192.168.1.110" or the subnet mask like "192.168.2.0/24".  

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
          - <fill-in-your-ip-address-pool-here> # Fill in an IP pool.
    ```
4. Apply the YAML config.
    ```shell
    kubectl apply -f metallb-config.yaml
    ```

5. Check the status of `iomesh-access` service, ensuring an external IP from the IP pool has been assigned to `MetalLB`.
    ```shell
    watch kubectl get service iomesh-access -n iomesh-system
    ```
    ```output
    NAME            TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)                                                          AGE
    iomesh-access   LoadBalancer   10.96.22.212   192.168.2.1     3260:32012/TCP,10206:31920/TCP,10201:31402/TCP,10207:31802/TCP   45h
    ```
6. Set `spec.redirector.iscsiVirtualIP` to the external IP by running the following command. Once edited, the `iomesh-iscsi-redirector` pod will automatically restart to make the modification take effect.

    > **_NOTE_:** `spec.redirector.iscsiVirtualIP` should be the same as the external IP. If the external IP is changed, update `spec.redirector.iscsiVi rtualIP`.

<!--END_DOCUSAURUS_CODE_TABS-->

## IOMesh as iSCSI Target

IOMesh provides support for the external iSCSI access service. You can create an iSCSI LUN by creating a PVC that can be accessed via any iSCSI client such as `open-iscsi` located beyond the Kubernetes cluster.

> **_NOTE_**: This function requires the iSCSI client to be able to access the `DATA_CIDR` segment that was configured during IOMesh installation.

### Create iSCSI LUN using PVC

1. Create an external iSCSI LUN using PVC. You may obtain the iSCSI client IQNs by using the command `cat /etc/iscsi/initiatorname.iscsi`.
    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: external-iscsi
      annotations:
        # Mark this PVC as a LUN for external use.
        iomesh.com/external-use: "true"
        # Set `initiator iqn acl` for LUN. If left unspecified, all initiators will be prohibited from accessing this PVC.
        # If `accessModes` is `RWO`, you can only set 1 value in this field.
        # If `accessModes` is `RWX`, you can set multiple values in this field and separate them with the comma (,).
        # To allow all IQNs to access this PVC, set the value to "*/*".
        iomesh.com/iscsi-lun-iqn-allow-list: "iqn.1994-05.com.example:a6c97f775dcb"
    spec:
      storageClassName: iomesh-csi-driver
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 1Gi
    ```
    > **_NOTE_**: You can also set the field `iomesh.com/iscsi-lun-iqn-allow-list` after the PVC is created.

2. Once the PVC transitions to the `Bound` state, run the following command to view the field `spec.volumeAttributes.iscsiEntrypoint`.
    ```shell
    kubectl get pv pvc-d84b4657-7ab5-4212-9270-ce40e6a1356a -o jsonpath='{.spec.csi.volumeAttributes.iscsiEndpoint}'
    ```
    ```output
    iscsi://cluster-loadbalancer-ip:3260/iqn.2016-02.com.smartx:system:54e7022b-2dcc-4b43-800c-e52b6fad07d3/1
    # The IP and port number of iSCSI Portal is the cluster LoadBalancer IP and 3260.
    # The target is `iqn.2016-02.com.smartx:system:54e7022b-2dcc-4b43-800c-e52b6fad07d3`.
    # LUN ID is 1.
    ```
    With the above information, you can use any iSCSI client to access the LUN. For example, if `cluster-loadbalancer-ip` is 192.168.25.101 and the iSCSI client is `open-iscsi`, run the following command:

    ```shell
    iscsiadm -m discovery -t sendtargets  -p 192.168.25.101:3260 --discover
    iscsiadm -m node -T iqn.2016-02.com.smartx:system:54e7022b-2dcc-4b43-800c-e52b6fad07d3 -p 192.168.25.101:3260  --login
    ```

### Delete PVC

To delete a PVC for an iSCSI LUN, ensure that the `iomesh.com/iscsi-lun-iqn-allow-list` field in the PVC is blank or is already deleted. Whether the external iSCSI LUN is retained after deleting the PVC depends on the `reclaimPolicy` field in the StorageClass of the PVC.

### External LUN from Multiple Clusters

To utilize external storage from multiple IOMesh clusters, simply configure the YAML file for the desired cluster.

Take the cluster `iomesh-cluster-1` in the namespace `iomesh-cluster-1` as an example. To use storage from the cluster as an external LUN, run the following command to set the `spec.redirector.iscsiVirtualIP` field to the external IP of the `iomesh-access` service. Once the changes are saved, the `iomesh-cluster-1-iscsi-redirector` pod will automatically restart to apply the modification.
```shell
kubectl edit iomesh iomesh-cluster-1 -n iomesh-cluster-1
```
## IOMesh via CSI for External Storage

IOMesh 支持直接对外提供 CSI 接入服务。用户可以通过在计算 K8s 集群部署 IOMesh CSI Driver 的方式来使用 IOMesh 提供的存储服务。

> **_NOTE_**: 为了顺利使用该功能，计算 K8s 集群需要能够访问 IOMesh 部署时配置的 DATA_CIDR 网段






