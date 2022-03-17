---
id: external-iscsi
title: Use IOMesh as iSCSI Target
sidebar_label: Use IOMesh as iSCSI Target
---

IOMesh supports to directly provide iSCSI services externally. Users can create an iSCSI LUN (hereinafter referred to as external iSCSI LUN) by creating a PVC, and connect the iSCSI LUN by using any iSCSI client (such as `open-iscsi`) outside the K8s cluster.

## Configure Stable iSCSI Access Point

In order to ensure the high availability and stable IP address for the iSCSI service access point, IOMesh uses K8s's LoadBalancer type service as the iSCSI service access point. This service needs to be created by users, and the specific steps are different in different IOMesh cluster deployment environments:
*  When an IOMesh cluster is deployed in one of the cloud providers such as GCP, AWS, Azure, etc., that natively support the LoadBalancer type service in K8s (for a detailed cloud provider list, please see [internal-load-balancer](https://kubernetes.io/docs/concepts/services-networking/service/#internal-load-balancer)), users can refer to the `In-Tree LoadBalancer` section below.
* For other deployment scenarios (such as bare metal), users can refer to the `Out-of-Tree LoadBalancer` section below.

<!--DOCUSAURUS_CODE_TABS-->

<!--In-Tree LoadBalancer-->
1. Create a file called `iomesh-access-lb-service.yaml` and write the following contents:

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

2. Apply the service configuration

    ```bash
    kubectl apply -f iomesh-access-lb-service.yaml
    ```

3. Check the service status

    ```bash
    kubectl get service iomesh-access-lb -n iomesh-system
    ```
K8s will call the interface corresponding to the IaaS platform and allocate an external-ip to the service you create as the entry to the LoadBalancer.

Finally, execute the `kubectl edit iomesh -n iomesh-system` command, set the `spec.redirector.iscsiVirtualIP` to the external-ip of the `iomesh-access-lb` service. After saving, the `iomesh-iscsi-redirector` Pod will restart automatically to make the settings take effect.

> **_NOTE_:** `spec.redirector.iscsiVirtualIP` needs to be consistent with external-ip of the `iomesh-access-lb` service. If external-ip changes, remember to update `spec.redirector.iscsiVirtualIP` at the same time.

<!--Out-of-Tree LoadBalancer-->
1. Create a file called `iomesh-access-lb-service.yaml` and write the following contents:

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

2. Apply the service configuration

    ```bash
    kubectl apply -f iomesh-access-lb-service.yaml
    ```

3. Check the service status

    ```bash
    kubectl get service iomesh-access-lb -n iomesh-system
    ```

Since IOMesh runs in a bare metal environment or in other cloud providers that do not natively support the LoadBalancer type service in K8s, K8s does not provide a default implementation for the load balancer, and the created LoadBalancer service will always be in a pending status. Now users need to install `MetallLB` in the K8s cluster as the default implementation for the load balancer, and the installation and configuration methods are described below.

1. Makre sure that the cluster meets the requirements for `MetalLB` in the [Installation Preparation](https://metallb.universe.tf/installation/#preparation) section.

2. Install `MetalLB`

    ```bash
    helm repo add metallb https://metallb.github.io/metallb
    helm install metallb metallb/metallb --version 0.12.1
    ```

3. Create a `MetalLB` ConfigMap file called `metallb-config.yaml`, set the work mode of `MetalLB` to layer2 (based on arp), and allocate an IP address pool to `MetalLB`.

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
Replace the commented part in `<fill-in-your-ip-address-pool-here>` with an unused IP address pool in the physical network, you can use the ip-range format, such as "192.168.1.100-192.168.1.110", or use the subnet mask format, such as "192.168.2.0/24".

4. Apply the ConfigMap configuration

    ```bash
    kubectl apply -f metallb-config.yaml
    ```

5. Check the service status to ensure that the external-ip from the IP address pool has been allocated to `MetalLB`.

    ```bash
    watch kubectl get service iomesh-access-lb -n iomesh-system
    ```

Finally, execute the `kubectl edit iomesh -n iomesh-system` command, set the `spec.redirector.iscsiVirtualIP` to the external-ip of the `iomesh-access-lb` service. After saving, the `iomesh-iscsi-redirector` Pod will restart automatically to make the settings take effect.

> **_NOTE_:** `spec.redirector.iscsiVirtualIP` needs to be consistent with external-ip of the `iomesh-access-lb` service. If external-ip changes, remember to update `spec.redirector.iscsiVirtualIP` at the same time.

<!--END_DOCUSAURUS_CODE_TABS-->

## Create External iSCSI LUN by Using PVC

To create an external iSCSI LUN using a PVC, you need to add two annotation fields to the PVC. The descriptions and a complete example of the fields are described below.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: external-iscsi
  annotations:
    # Mark the PVC as a LUN used externally from the cluster
    iomesh.com/external-use: "true"
    # Set the LUN's initiator iqn acl. If this field is not configured, all the initiator logins are prohibited. 
    # When the PVC's accessModes is RWO, this field can have one and only one value; when the PVC's accessModes 
    # is RWX, this field can have multiple values separated by commas. For all allowed iqns, the configuration is "*/*" 
    iomesh.com/iscsi-lun-iqn-allow-list: "iqn.1994-05.com.example:a6c97f775dcb"
spec:
  storageClassName: iomesh-csi-driver
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

> **_NOTE_:** The `iomesh.com/iscsi-lun-iqn-allow-list` field can be set during PVC creation or after PVC creation, to support dynamic updates. Generally, the iSCSI client's iqn can be acquired through the `cat /etc/iscsi/initiatorname.iscsi` command.

After the PVC is created and enters the Bound state, you can check the `spec.volumeAttributes.iscsiEntrypoint` field of the corresponding PV.

```bash
kubectl get pv pvc-d84b4657-7ab5-4212-9270-ce40e6a1356a -o jsonpath='{.spec.csi.volumeAttributes.iscsiEndpoint}'
# output
iscsi://cluster-loadbalancer-ip:3260/iqn.2016-02.com.smartx:system:54e7022b-2dcc-4b43-800c-e52b6fad07d3/1
```

In this example:
* The IP address and port number of the iSCSI Portal are cluster-loadbalancer-ip and 3260, where the cluster-loadbalancer-ip is replaced with the iomesh-access-lb service external-ip configured previously in your actual use.
* The Target name is iqn.2016-02.com.smartx:system:54e7022b-2dcc-4b43-800c-e52b6fad07d3.
* The LUN ID is 1.

With the above information, you can use any iSCSI client to connect. Assume the cluster-loadbalancer-ip is 192.168.25.101, take `open-iscsi` as an example:

```bash
iscsiadm -m discovery -t sendtargets  -p 192.168.25.101:3260 --discover
iscsiadm -m node -T iqn.2016-02.com.smartx:system:54e7022b-2dcc-4b43-800c-e52b6fad07d3 -p 192.168.25.101:3260  --login
```

## Delete PVC

For security reasons, IOMesh does not allow to delete the PVCs of which the value of the `iomesh.com/iscsi-lun-iqn-allow-list` field is not empty. If you want to delete the PVC, you need to ensure that the value of the `iomesh.com/iscsi-lun-iqn-allow-list` field is `""`, or first delete the `iomesh.com/iscsi-lun-iqn-allow-list` field, then delete the PVC. Whether the external iSCSI LUN is retained after the PVC is deleted depends on the `reclaimPolicy` field corresponding to the StorageClass used by the PVC.
